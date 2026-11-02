#!/usr/bin/env bash
# Restore a GoDaddy zone from a backup produced by godaddy-apply-dns.sh.
#
#   export GODADDY_PAT='gd_pat_...'
#   CONFIRM=yes scripts/godaddy-restore-dns.sh dns-backup-20261102T000000Z.json
#
# Only the A records at the apex are restored; other record types are left
# untouched so an unrelated edit made after the backup is not clobbered.
set -euo pipefail

DOMAIN="${DOMAIN:-littlejoyarcade.site}"
API="https://api.godaddy.com/v1/domains/${DOMAIN}"
FILE="${1:-}"

: "${GODADDY_PAT:?Set GODADDY_PAT to a GoDaddy personal access token}"
if [ -z "${FILE}" ] || [ ! -f "${FILE}" ]; then
  echo "Usage: scripts/godaddy-restore-dns.sh <dns-backup.json>" >&2
  exit 1
fi

auth=(-H "Authorization: Bearer ${GODADDY_PAT}" -H 'Accept: application/json' -H 'Content-Type: application/json')

node -e '
const records = require(process.argv[1])
const apex = records.filter((r) => r.type === "A" && (r.name === "@" || r.name === ""))
console.log(JSON.stringify(apex))
' "${FILE}" > /tmp/godaddy-restore-a.json

echo "Restoring apex A records from ${FILE}:"
cat /tmp/godaddy-restore-a.json
echo

if [ "${CONFIRM:-}" != "yes" ]; then
  echo "Dry run. Re-run with CONFIRM=yes to apply."
  exit 0
fi

curl -s -o /dev/null -w 'delete current A @ -> HTTP %{http_code}\n' --max-time 20 "${auth[@]}" -X DELETE "${API}/records/A/@"
if [ "$(cat /tmp/godaddy-restore-a.json)" != "[]" ]; then
  curl -fsS --max-time 20 "${auth[@]}" -X POST "${API}/records" -d "$(cat /tmp/godaddy-restore-a.json)" > /dev/null
  echo "restored apex A records"
fi

dig +short A "${DOMAIN}" @1.1.1.1
