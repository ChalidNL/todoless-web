#!/usr/bin/env python3
"""
Paperless-ngx → Todoless task auto-creator.

Polls Paperless for documents tagged with 'todo' and creates corresponding
tasks in Todoless via the PocketBase API.

Usage:
    python paperless-poller.py

Environment:
    PAPERLESS_API_URL   - Paperless API base URL (e.g. http://192.168.2.100:8010/api)
    PAPERLESS_API_KEY   - Paperless API token
    POCKETBASE_URL      - PocketBase API URL (e.g. http://localhost:8090)
    POCKETBASE_EMAIL    - Todoless admin email
    POCKETBASE_PASSWORD - Todoless admin password
    TODO_TAG            - Tag name that triggers task creation (default: 'todo')
    POLL_INTERVAL       - Seconds between polls (default: 300)
"""

from __future__ import annotations

import os
import sys
import time
import json
import logging
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone

import requests

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
log = logging.getLogger('paperless-poller')

# --- Configuration ---
PAPERLESS_API = os.getenv('PAPERLESS_API_URL', 'http://192.168.2.100:8010/api').rstrip('/')
PAPERLESS_API_KEY = os.getenv('PAPERLESS_API_KEY', '')
POCKETBASE_URL = os.getenv('POCKETBASE_URL', 'http://localhost:8090').rstrip('/')
POCKETBASE_EMAIL = os.getenv('POCKETBASE_EMAIL', '')
POCKETBASE_PASSWORD = os.getenv('POCKETBASE_PASSWORD', '')
TODO_TAG = os.getenv('TODO_TAG', 'todo')
POLL_INTERVAL = int(os.getenv('POLL_INTERVAL', '300'))
STATE_FILE = Path(os.getenv('STATE_FILE', '/tmp/paperless-poller-state.json'))

# --- State tracking ---
def load_state() -> set[int]:
    """Load set of already-processed Paperless document IDs."""
    if STATE_FILE.exists():
        try:
            data = json.loads(STATE_FILE.read_text())
            return set(data.get('processed', []))
        except (json.JSONDecodeError, KeyError):
            return set()
    return set()


def save_state(processed: set[int]) -> None:
    """Save processed document IDs to state file."""
    STATE_FILE.write_text(json.dumps({'processed': sorted(processed)}, indent=2))


# --- Paperless API ---
class PaperlessClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Authorization': f'Token {api_key}'})

    def get_tags(self) -> dict[str, int]:
        """Return {tag_name: tag_id} mapping."""
        resp = self.session.get(f'{self.base_url}/tags/', params={'page_size': 200}, timeout=30)
        resp.raise_for_status()
        return {t['name']: t['id'] for t in resp.json().get('results', [])}

    def get_documents_with_tag(self, tag_id: int) -> list[dict]:
        """Get all documents with a specific tag."""
        docs = []
        page = 1
        while True:
            resp = self.session.get(
                f'{self.base_url}/documents/',
                params={'tags__name__iexact': TODO_TAG, 'page': page, 'page_size': 50, 'ordering': 'created'},
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            docs.extend(data.get('results', []))
            if not data.get('next'):
                break
            page += 1
        return docs

    def get_document(self, doc_id: int) -> dict:
        """Get single document metadata."""
        resp = self.session.get(f'{self.base_url}/documents/{doc_id}/', timeout=30)
        resp.raise_for_status()
        return resp.json()

    def get_document_content(self, doc_id: int) -> str:
        """Get extracted text content of a document."""
        resp = self.session.get(f'{self.base_url}/documents/{doc_id}/', timeout=30)
        resp.raise_for_status()
        return resp.json().get('content', '')


# --- PocketBase API ---
class PocketBaseClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.user_id: Optional[str] = None

    def login(self, email: str, password: str) -> None:
        """Authenticate with PocketBase."""
        resp = requests.post(
            f'{self.base_url}/api/collections/users/auth-with-password',
            json={'identity': email, 'password': password},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        self.token = data['token']
        self.user_id = data['record']['id']
        log.info(f'Logged in to PocketBase as user {self.user_id}')

    def _headers(self) -> dict:
        if not self.token:
            raise RuntimeError('Not authenticated')
        return {'Authorization': f'Bearer {self.token}'}

    def create_task(self, title: str, source: str = '', content: str = '') -> dict:
        """Create a task in PocketBase."""
        resp = requests.post(
            f'{self.base_url}/api/collections/tasks/records',
            headers=self._headers(),
            json={
                'title': title,
                'status': 'todo',
                'blocked': False,
                'labels': ['paperless', 'scan'] + ([source] if source else []),
                'is_private': False,
                'archived': False,
                'user': self.user_id,
            },
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def task_exists(self, title: str) -> bool:
        """Check if a task with this title already exists."""
        import urllib.parse
        filter_expr = f'title="{title}"'
        resp = requests.get(
            f'{self.base_url}/api/collections/tasks/records',
            headers=self._headers(),
            params={'filter': filter_expr, 'page': 1, 'perPage': 1},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get('totalItems', 0) > 0


def generate_task_title(doc: dict) -> str:
    """Generate a task title from Paperless document metadata."""
    title = doc.get('title', 'Untitled document')
    created = doc.get('created', '')
    correspondent = doc.get('correspondent')
    if correspondent and isinstance(correspondent, dict):
        correspondent = correspondent.get('name', '')

    parts = []
    if correspondent:
        parts.append(correspondent)
    parts.append(title)
    if created:
        parts.append(created[:10])

    return ' - '.join(parts)[:128]


def poll_and_create(
    paperless: PaperlessClient,
    pocketbase: PocketBaseClient,
    processed: set[int],
) -> set[int]:
    """Poll Paperless and create tasks for new todo-tagged documents."""
    try:
        tags = paperless.get_tags()
    except Exception as e:
        log.error(f'Failed to fetch tags from Paperless: {e}')
        return processed

    todo_tag_id = tags.get(TODO_TAG)
    if todo_tag_id is None:
        log.warning(f'Tag "{TODO_TAG}" not found in Paperless. Available: {list(tags.keys())[:10]}')
        return processed

    try:
        docs = paperless.get_documents_with_tag(todo_tag_id)
    except Exception as e:
        log.error(f'Failed to fetch documents from Paperless: {e}')
        return processed

    new_processed = set(processed)
    created_count = 0

    for doc in docs:
        doc_id = doc['id']
        if doc_id in processed:
            continue

        title = generate_task_title(doc)

        if pocketbase.task_exists(title):
            log.info(f'Task already exists for doc {doc_id}: {title}')
            new_processed.add(doc_id)
            continue

        try:
            task = pocketbase.create_task(title, source=f'paperless:{doc_id}')
            log.info(f'Created task "{task.get("title")}" (id={task.get("id")}) for Paperless doc {doc_id}')
            new_processed.add(doc_id)
            created_count += 1
        except Exception as e:
            log.error(f'Failed to create task for doc {doc_id}: {e}')

    if created_count:
        log.info(f'Created {created_count} new task(s) from Paperless')

    return new_processed


def main() -> None:
    if not PAPERLESS_API_KEY:
        log.error('PAPERLESS_API_KEY not set')
        sys.exit(1)
    if not POCKETBASE_EMAIL or not POCKETBASE_PASSWORD:
        log.error('POCKETBASE_EMAIL and POCKETBASE_PASSWORD must be set')
        sys.exit(1)

    paperless = PaperlessClient(PAPERLESS_API, PAPERLESS_API_KEY)
    pocketbase = PocketBaseClient(POCKETBASE_URL)

    try:
        pocketbase.login(POCKETBASE_EMAIL, POCKETBASE_PASSWORD)
    except Exception as e:
        log.error(f'Failed to login to PocketBase: {e}')
        sys.exit(1)

    processed = load_state()
    log.info(f'Loaded state: {len(processed)} previously processed documents')

    # First run: process immediately
    log.info(f'Polling Paperless for documents tagged "{TODO_TAG}"...')
    processed = poll_and_create(paperless, pocketbase, processed)
    save_state(processed)

    # Then poll periodically
    log.info(f'Starting poll loop (interval: {POLL_INTERVAL}s)')
    while True:
        time.sleep(POLL_INTERVAL)
        try:
            processed = poll_and_create(paperless, pocketbase, processed)
            save_state(processed)
        except Exception as e:
            log.error(f'Poll error: {e}')


if __name__ == '__main__':
    main()
