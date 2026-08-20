#!/usr/bin/env bash
# Smoke-test all tenant dashboard API endpoints (CI / Forge).
# Exits non-zero when auth or any endpoint fails.
set -euo pipefail

BASE="${BASE_URL:-http://127.0.0.1:8000}"
TENANT="${TENANT_SLUG:-demo}"
EMAIL="${TENANT_EMAIL:-owner@demo.test}"
PASSWORD="${TENANT_PASSWORD:-password}"
ORIGIN="$BASE"
COOKIE_JAR=$(mktemp)
FAILURES=0
trap 'rm -f "$COOKIE_JAR"' EXIT

get_xsrf() {
  php -r '$l=file("'"$COOKIE_JAR"'"); foreach($l as $line){ if(str_contains($line,"XSRF-TOKEN")) { $p=preg_split("/\t/", trim($line)); echo urldecode($p[6]); break; }}'
}

common_headers() {
  echo -H "Accept: application/json"
  echo -H "X-Tenant-Slug: $TENANT"
  echo -H "X-Requested-With: XMLHttpRequest"
  echo -H "Referer: $ORIGIN/"
  echo -H "Origin: $ORIGIN"
  echo -H "X-XSRF-TOKEN: $(get_xsrf)"
}

expect_status() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  local body_file="$4"
  if [[ "$actual" == "$expected" ]]; then
    echo "OK  $name ($actual)"
  else
    echo "FAIL $name (expected $expected, got $actual)"
    head -c 300 "$body_file" 2>/dev/null || true
    echo
    FAILURES=$((FAILURES + 1))
  fi
}

echo "== Tammer Wash API smoke test =="
echo "Base: $BASE | Tenant: $TENANT"

curl -s -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/sanctum/csrf-cookie" \
  -H "Referer: $ORIGIN/" -H "Origin: $ORIGIN" -o /dev/null

LOGIN_BODY=$(mktemp)
LOGIN_CODE=$(curl -s -c "$COOKIE_JAR" -b "$COOKIE_JAR" -X POST "$BASE/api/v1/auth/login" \
  -H "Accept: application/json" -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT" -H "X-Requested-With: XMLHttpRequest" \
  -H "Referer: $ORIGIN/" -H "Origin: $ORIGIN" \
  -H "X-XSRF-TOKEN: $(get_xsrf)" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -o "$LOGIN_BODY" -w "%{http_code}")
expect_status "auth/login" "200" "$LOGIN_CODE" "$LOGIN_BODY"

USER_BODY=$(mktemp)
USER_CODE=$(curl -s -b "$COOKIE_JAR" "$BASE/api/v1/auth/user" \
  -H "Accept: application/json" -H "X-Tenant-Slug: $TENANT" -H "X-Requested-With: XMLHttpRequest" \
  -H "Referer: $ORIGIN/" -H "Origin: $ORIGIN" \
  -H "X-XSRF-TOKEN: $(get_xsrf)" \
  -o "$USER_BODY" -w "%{http_code}")
expect_status "auth/user" "200" "$USER_CODE" "$USER_BODY"

BRANCH_BODY=$(mktemp)
BRANCH_CODE=$(curl -s -b "$COOKIE_JAR" "$BASE/api/v1/branches?per_page=1" \
  -H "Accept: application/json" -H "X-Tenant-Slug: $TENANT" -H "X-Requested-With: XMLHttpRequest" \
  -H "Referer: $ORIGIN/" -H "Origin: $ORIGIN" \
  -H "X-XSRF-TOKEN: $(get_xsrf)" \
  -o "$BRANCH_BODY" -w "%{http_code}")
BRANCH_ID=$(php -r '$j=json_decode(file_get_contents("'"$BRANCH_BODY"'"), true); echo $j["data"][0]["id"] ?? "";')
TODAY=$(date +%Y-%m-%d)

test_get() {
  local name="$1"
  local path="$2"
  local body
  body=$(mktemp)
  local code
  code=$(curl -s -b "$COOKIE_JAR" "$BASE/api/v1/$path" \
    -H "Accept: application/json" -H "X-Tenant-Slug: $TENANT" -H "X-Requested-With: XMLHttpRequest" \
    -H "Referer: $ORIGIN/" -H "Origin: $ORIGIN" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -o "$body" -w "%{http_code}")
  expect_status "$name" "200" "$code" "$body"
}

test_get "dashboard/stats" "dashboard/stats"
test_get "settings" "settings"
test_get "tax-settings" "tax-settings"
test_get "branches" "branches?per_page=50"
test_get "customers" "customers?per_page=50"
test_get "vehicles" "vehicles?per_page=50"
test_get "services" "services?per_page=50"
test_get "service-categories" "service-categories?per_page=50"
test_get "pricing/rules" "pricing/rules?per_page=50"
test_get "pricing/coupons" "pricing/coupons?per_page=50"
test_get "pricing/discounts" "pricing/discounts?per_page=50"
test_get "bookings" "bookings?per_page=50"
test_get "orders" "orders?per_page=50"
test_get "invoices" "invoices?per_page=50"
test_get "tax-reports/daily" "tax-reports/daily"

if [[ -n "$BRANCH_ID" ]]; then
  test_get "time-slots/available" "time-slots/available?branch_id=${BRANCH_ID}&date=${TODAY}"
  test_get "queue/entries" "queue/entries?per_page=50&branch_id=${BRANCH_ID}"
  test_get "queue/screen" "queue/screen?branch_id=${BRANCH_ID}"
  test_get "queue/estimated-wait" "queue/estimated-wait?branch_id=${BRANCH_ID}"
  test_get "tax-reports/breakdown" "tax-reports/breakdown?from=${TODAY}&to=${TODAY}&branch_id=${BRANCH_ID}"
else
  echo "WARN no branch_id — skipping branch-scoped endpoints"
  FAILURES=$((FAILURES + 1))
fi

echo "== Done: $FAILURES failure(s) =="
exit "$FAILURES"
