#!/usr/bin/env bash
# Role-based API access test for Tammer Wash demo tenant.
set -euo pipefail

BASE="${BASE_URL:-http://127.0.0.1:8000}"
TENANT="${TENANT_SLUG:-demo}"
PASSWORD="${TENANT_PASSWORD:-password}"
ORIGIN="$BASE"
FAILURES=0
PASSED=0

get_xsrf() {
  local jar="$1"
  php -r '$l=file($argv[1]); foreach($l as $line){ if(str_contains($line,"XSRF-TOKEN")) { $p=preg_split("/\t/", trim($line)); echo urldecode($p[6]); break; }}' "$jar"
}

login_role() {
  local email="$1"
  local jar
  jar=$(mktemp)
  curl -s -c "$jar" -b "$jar" "$BASE/sanctum/csrf-cookie" \
    -H "Referer: $ORIGIN/" -H "Origin: $ORIGIN" -o /dev/null
  local code
  code=$(curl -s -c "$jar" -b "$jar" -X POST "$BASE/api/v1/auth/login" \
    -H "Accept: application/json" -H "Content-Type: application/json" \
    -H "X-Tenant-Slug: $TENANT" -H "X-Requested-With: XMLHttpRequest" \
    -H "Referer: $ORIGIN/" -H "Origin: $ORIGIN" \
    -H "X-XSRF-TOKEN: $(get_xsrf "$jar")" \
    -d "{\"email\":\"$email\",\"password\":\"$PASSWORD\"}" \
    -o /dev/null -w "%{http_code}")
  if [[ "$code" != "200" ]]; then
    echo "  WARN login failed for $email (HTTP $code)" >&2
  fi
  printf '%s' "$jar"
}

api_get() {
  local jar="$1"
  local path="$2"
  curl -s -b "$jar" "$BASE/api/v1/$path" \
    -H "Accept: application/json" -H "X-Tenant-Slug: $TENANT" -H "X-Requested-With: XMLHttpRequest" \
    -H "Referer: $ORIGIN/" -H "Origin: $ORIGIN" \
    -H "X-XSRF-TOKEN: $(get_xsrf "$jar")" \
    -o /dev/null -w "%{http_code}"
}

expect() {
  local role="$1"
  local endpoint="$2"
  local expected="$3"
  local actual="$4"
  if [[ "$actual" == "$expected" ]]; then
    echo "  OK  $role $endpoint → $actual"
    PASSED=$((PASSED + 1))
  else
    echo "  FAIL $role $endpoint → $actual (expected $expected)"
    FAILURES=$((FAILURES + 1))
  fi
}

run_role_tests() {
  local role="$1"
  local email="$2"
  echo ""
  echo "== Role: $role ($email) =="
  local jar
  jar=$(login_role "$email")

  case "$role" in
    owner)
      expect "$role" "dashboard/stats" "200" "$(api_get "$jar" "dashboard/stats")"
      expect "$role" "branches" "200" "$(api_get "$jar" "branches?per_page=5")"
      expect "$role" "settings" "200" "$(api_get "$jar" "settings")"
      expect "$role" "pricing/rules" "200" "$(api_get "$jar" "pricing/rules?per_page=5")"
      expect "$role" "bookings" "200" "$(api_get "$jar" "bookings?per_page=5")"
      expect "$role" "invoices" "200" "$(api_get "$jar" "invoices?per_page=5")"
      expect "$role" "tax-reports/daily" "200" "$(api_get "$jar" "tax-reports/daily")"
      ;;
    manager)
      expect "$role" "dashboard/stats" "200" "$(api_get "$jar" "dashboard/stats")"
      expect "$role" "branches" "200" "$(api_get "$jar" "branches?per_page=5")"
      expect "$role" "settings" "200" "$(api_get "$jar" "settings")"
      expect "$role" "bookings" "200" "$(api_get "$jar" "bookings?per_page=5")"
      expect "$role" "tax-reports/daily" "200" "$(api_get "$jar" "tax-reports/daily")"
      ;;
    cashier)
      expect "$role" "dashboard/stats" "200" "$(api_get "$jar" "dashboard/stats")"
      expect "$role" "bookings" "403" "$(api_get "$jar" "bookings?per_page=5")"
      expect "$role" "pricing/rules" "403" "$(api_get "$jar" "pricing/rules?per_page=5")"
      expect "$role" "settings" "403" "$(api_get "$jar" "settings")"
      expect "$role" "queue/entries" "200" "$(api_get "$jar" "queue/entries?per_page=5")"
      expect "$role" "orders" "200" "$(api_get "$jar" "orders?per_page=5")"
      expect "$role" "invoices" "200" "$(api_get "$jar" "invoices?per_page=5")"
      expect "$role" "tax-reports/daily" "403" "$(api_get "$jar" "tax-reports/daily")"
      ;;
    worker)
      expect "$role" "dashboard/stats" "200" "$(api_get "$jar" "dashboard/stats")"
      expect "$role" "orders" "200" "$(api_get "$jar" "orders?per_page=5")"
      expect "$role" "queue/entries" "200" "$(api_get "$jar" "queue/entries?per_page=5")"
      expect "$role" "invoices" "403" "$(api_get "$jar" "invoices?per_page=5")"
      expect "$role" "bookings" "403" "$(api_get "$jar" "bookings?per_page=5")"
      expect "$role" "settings" "403" "$(api_get "$jar" "settings")"
      expect "$role" "tax-reports/daily" "403" "$(api_get "$jar" "tax-reports/daily")"
      ;;
  esac

  rm -f "$jar"
}

echo "== Tammer Wash Role Access Test =="
echo "Base: $BASE | Tenant: $TENANT"

run_role_tests owner owner@demo.test
run_role_tests manager manager@demo.test
run_role_tests cashier cashier@demo.test
run_role_tests worker worker@demo.test

echo ""
echo "== Summary: $PASSED passed, $FAILURES failed =="
echo "NOTE: accountant and customer roles are NOT implemented in config/tammer.php"
exit "$FAILURES"
