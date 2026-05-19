#!/usr/bin/env bash
# E2E test: API token authentication flow (API-002)
# Tests: create token -> use Bearer -> get 200 -> revoke -> get 401
# 
# Prerequisites:
#   - Running PocketBase instance with api_tokens collection migrated
#   - A registered user with known credentials
#   - BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD exported

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8090}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@todoless.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-changeme123}"

PASS=0
FAIL=0

green() { echo -e "\033[32m$1\033[0m"; }
red()   { echo -e "\033[31m$1\033[0m"; }
bold()  { echo -e "\033[1m$1\033[0m"; }

# ── step: run test, track pass/fail ──
step() {
  local desc="$1"
  shift
  bold "• $desc"
  if "$@"; then
    green "  ✓ PASS"
    PASS=$((PASS+1))
  else
    red "  ✗ FAIL"
    FAIL=$((FAIL+1))
  fi
}

# ── 1. Authenticate as admin ──
login_admin() {
  echo "  › Authenticating as $ADMIN_EMAIL ..."
  local resp
  resp=$(curl -s -X POST "$BASE_URL/api/collections/users/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
  local token
  token=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")
  if [ -z "$token" ]; then
    echo "  ✗ Login failed: $(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message','unknown error'))" 2>/dev/null || echo "$resp")"
    return 1
  fi
  ADMIN_TOKEN="$token"
  echo "  › Token obtained"
  return 0
}

# ── 2. Create API token ──
create_api_token() {
  echo "  › Creating API token ..."
  local resp
  resp=$(curl -s -X POST "$BASE_URL/api/todoless/api-tokens" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"name":"E2E Test Token","permissions":["tasks:read","tasks:write","groceries:*"],"expires_at":""}')
  local raw_token
  raw_token=$(echo "$resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null || echo "")
  local id
  id=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")
  if [ -z "$raw_token" ] || [ -z "$id" ]; then
    echo "  ✗ Create failed: $(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error','response parse failed'))" 2>/dev/null || echo "$resp")"
    return 1
  fi
  API_TOKEN_RAW="$raw_token"
  API_TOKEN_ID="$id"
  echo "  › Token created: id=$id"
  echo "  › Raw token (first 12 chars): ${raw_token:0:12}..."
  return 0
}

# ── 3. Call hook-health with Bearer token ──
call_with_bearer() {
  echo "  › GET /api/todoless/hook-health (with Bearer token) ..."
  local resp
  resp=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/todoless/hook-health" \
    -H "Authorization: Bearer $API_TOKEN_RAW")
  if [ "$resp" != "200" ]; then
    echo "  ✗ Expected 200, got $resp"
    return 1
  fi
  echo "  › Got HTTP $resp"
  return 0
}

# ── 4. Call entry listing (should work with tasks:read scope) ──
call_entries_with_bearer() {
  echo "  › GET /api/todoless/entries (with Bearer token) ..."
  local resp
  resp=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/todoless/entries" \
    -H "Authorization: Bearer $API_TOKEN_RAW")
  # entries endpoint may return 200 or 404 based on whether data exists
  if [ "$resp" != "200" ] && [ "$resp" != "404" ]; then
    echo "  ✗ Expected 200, got $resp"
    return 1
  fi
  echo "  › Got HTTP $resp"
  return 0
}

# ── 5. List tokens via admin session ──
list_tokens() {
  echo "  › GET /api/todoless/api-tokens (list tokens) ..."
  local resp
  resp=$(curl -s -X GET "$BASE_URL/api/todoless/api-tokens" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  local count
  count=$(echo "$resp" | python3 -c "import sys,json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
  echo "  › Found $count token(s) in list"
  if [ "$count" -eq 0 ]; then
    echo "  ✗ Expected at least 1 token"
    return 1
  fi
  return 0
}

# ── 6. Toggle token disabled ──
toggle_token_off() {
  echo "  › PATCH /api/todoless/api-tokens/$API_TOKEN_ID/toggle (disable) ..."
  local resp
  resp=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/api/todoless/api-tokens/$API_TOKEN_ID/toggle" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"enabled":false}')
  if [ "$resp" != "200" ]; then
    echo "  ✗ Expected 200, got $resp"
    return 1
  fi
  echo "  › Token disabled: HTTP $resp"
  return 0
}

# ── 7. Verify disabled token returns 401 ──
verify_disabled_token_401() {
  echo "  › GET /api/todoless/hook-health (with DISABLED token) ..."
  local resp
  resp=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/todoless/hook-health" \
    -H "Authorization: Bearer $API_TOKEN_RAW")
  if [ "$resp" != "401" ]; then
    echo "  ✗ Expected 401 for disabled token, got $resp"
    return 1
  fi
  echo "  › Got HTTP $resp (disabled token correctly rejected)"
  return 0
}

# ── 8. Re-enable token ──
toggle_token_on() {
  echo "  › PATCH /api/todoless/api-tokens/$API_TOKEN_ID/toggle (re-enable) ..."
  local resp
  resp=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE_URL/api/todoless/api-tokens/$API_TOKEN_ID/toggle" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"enabled":true}')
  if [ "$resp" != "200" ]; then
    echo "  ✗ Expected 200, got $resp"
    return 1
  fi
  echo "  › Token re-enabled: HTTP $resp"
  return 0
}

# ── 9. Delete token ──
delete_token() {
  echo "  › DELETE /api/todoless/api-tokens/$API_TOKEN_ID ..."
  local resp
  resp=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/todoless/api-tokens/$API_TOKEN_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  if [ "$resp" != "200" ]; then
    echo "  ✗ Expected 200, got $resp"
    return 1
  fi
  echo "  › Token deleted: HTTP $resp"
  return 0
}

# ── 10. Verify deleted token returns 401 ──
verify_deleted_token_401() {
  echo "  › GET /api/todoless/hook-health (with DELETED token) ..."
  local resp
  resp=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/todoless/hook-health" \
    -H "Authorization: Bearer $API_TOKEN_RAW")
  if [ "$resp" != "401" ]; then
    echo "  ✗ Expected 401 for deleted token, got $resp"
    return 1
  fi
  echo "  › Got HTTP $resp (deleted token correctly rejected)"
  return 0
}

# ── 11. Verify no Bearer still works (backward compatible) ──
verify_backward_compatible() {
  echo "  › GET /api/todoless/hook-health (NO auth) ..."
  local resp
  resp=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/todoless/hook-health")
  if [ "$resp" != "200" ]; then
    echo "  ✗ Expected 200 (public endpoint), got $resp"
    return 1
  fi
  echo "  › Public endpoints still work without auth: HTTP $resp"
  return 0
}

# ── MAIN ──
echo ""
bold "═══ API Token Auth E2E Test Suite ═══"
echo ""
echo "Target: $BASE_URL"

step "1. Admin login"          login_admin
step "2. Create API token"     create_api_token
step "3. Bearer token → 200"   call_with_bearer
step "4. Bearer → entries"     call_entries_with_bearer
step "5. List tokens"          list_tokens
step "6. Disable token"        toggle_token_off
step "7. Disabled → 401"       verify_disabled_token_401
step "8. Re-enable token"      toggle_token_on
step "9. Delete token"         delete_token
step "10. Deleted → 401"       verify_deleted_token_401
step "11. Backward compat"     verify_backward_compatible

echo ""
bold "═══════════════════════════════════"
echo ""
green "PASSED: $PASS"
if [ "$FAIL" -gt 0 ]; then
  red "FAILED: $FAIL"
  echo ""
  exit 1
fi
echo ""
green "All tests passed! ✨"
echo ""
