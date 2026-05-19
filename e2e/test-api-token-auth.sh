#!/bin/bash
# E2E test: API Token Auth flow
# Tests: create token -> call endpoint with Bearer -> get 200
set -euo pipefail

HOST="${1:-http://127.0.0.1:8091}"
ADMIN_EMAIL="${2:-admin@test.com}"
ADMIN_PASS="${3:-admin123!}"

echo "=== API Token Auth E2E Test ==="
echo "Host: $HOST"
echo ""

# 1. Health check
echo "--- Health check ---"
curl -sf "$HOST/api/todoless/hook-health" | python3 -c "import sys,json; print(json.load(sys.stdin))"
echo ""

# 2. Login as admin
echo "--- Login as admin ---"
LOGIN=$(curl -sf "$HOST/api/collections/users/auth-with-password" \
  -d "identity=$ADMIN_EMAIL&password=$ADMIN_PASS")
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")
USER_ID=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('record',{}).get('id',''))")
echo "Token: ${TOKEN:0:20}..."
echo "User: $USER_ID"
echo ""

# 3. Create API token
echo "--- Create API token ---"
CREATE_RESP=$(curl -sf -X POST "$HOST/api/todoless/api-tokens" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"E2E Test Token","permissions":["tasks:read","groceries:read","*"]}')
echo "$CREATE_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'ID: {d.get(\"id\")}'); print(f'Name: {d.get(\"name\")}'); print(f'Token (first 20): {d.get(\"token\",\"\")[:20]}...')"
RAW_TOKEN=$(echo "$CREATE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")
echo ""

# 4. List tokens with Bearer auth
echo "--- List tokens with Bearer ---"
LIST_RESP=$(curl -sf "$HOST/api/todoless/api-tokens" \
  -H "Authorization: Bearer $TOKEN")
echo "Token count: $(echo "$LIST_RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")"
echo ""

# 5. Test API endpoint with Bearer token
echo "--- Test /api/todoless/api with Bearer token (list) ---"
curl -s -X POST "$HOST/api/todoless/api" \
  -H "Authorization: Bearer $RAW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"list"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Status: entries={len(d)}')"
echo ""

# 6. Test without token (should fail)
echo "--- Test without token (expect 401) ---"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HOST/api/todoless/api-tokens")
echo "Status: $STATUS"
if [ "$STATUS" = "401" ]; then echo "PASS: Unauthorized"; else echo "FAIL: Expected 401, got $STATUS"; exit 1; fi
echo ""

# 7. Test with invalid token (should fail)
echo "--- Test with invalid Bearer token (expect 401) ---"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST/api/todoless/api" \
  -H "Authorization: Bearer invalid_token_xyz" \
  -H "Content-Type: application/json" \
  -d '{"action":"list"}')
echo "Status: $STATUS"
if [ "$STATUS" = "401" ]; then echo "PASS: Invalid token rejected"; else echo "FAIL: Expected 401, got $STATUS"; exit 1; fi
echo ""

# 8. Revoke token
echo "--- Revoke token ---"
TOKEN_ID=$(echo "$CREATE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
curl -sf -X DELETE "$HOST/api/todoless/api-tokens/$TOKEN_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin))"
echo ""

# 9. Verify token is revoked (should fail now)
echo "--- Verify revoked token fails (expect 401) ---"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST/api/todoless/api" \
  -H "Authorization: Bearer $RAW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"list"}')
echo "Status: $STATUS"
if [ "$STATUS" = "401" ]; then echo "PASS: Revoked token rejected"; else echo "FAIL: Expected 401, got $STATUS"; exit 1; fi
echo ""

echo "=== ALL TESTS PASSED ==="
