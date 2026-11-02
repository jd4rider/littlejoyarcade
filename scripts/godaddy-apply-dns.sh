#!/usr/bin/env bash
# Point littlejoyarcade.site at Netlify without moving nameservers.
#
# Netlify's external-DNS setup needs one A record at the apex (GoDaddy does not
# support CNAME flattening). Everything else in the zone is preserved: the
# _dmarc TXT record, _domainconnect CNAME and the www CNAME to the apex.
#
#   export GODADDY_PAT='gd_pat_...'
#   scripts/godaddy-apply-dns.sh              # dry run, prints the plan
#   CONFIRM=yes scripts/godaddy-apply-dns.sh  # apply
#
# The token is read from the environment and never written to disk. A backup of
# the current zone is saved next to this script as dns-backup-*.json (gitignored).
set -euo pipefail

DOMAIN="${DOMAIN:-littlejoyarcade.site}"
APEX_IP="${NETLIFY_APEX_IP:-75.2.60.5}"
TTL="${TTL:-600}"
API="https://api.godaddy.com/v1/domains/${DOMAIN}"

: "${GODADDY_PAT:?Set GODADDY_PAT to a GoDaddy personal access token}"

auth=(-H "Authorization: Bearer ${GODADDY_PAT}" -H 'Accept: application/json' -H 'Content-Type: application/json')
here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
backup="${here}/dns-backup-$(date -u +%Y%m%dT%H%M%SZ).json"

echo "Domain:   ${DOMAIN}"
echo "Apex A:   ${APEX_IP} (ttl ${TTL})"
echo

curl -fsS --max-time 20 "${auth[@]}" "${API}/records" -o "${backup}"
echo "Backed up the current zone to $(basename "${backup}")"
node -e '
const records = require(process.argv[1])
for (const r of records) {
  const data = String(r.data).length > 64 ? String(r.data).slice(0, 61) + "..." : r.data
  console.log(`  ${String(r.type).padEnd(6)} ${String(r.name).padEnd(15)} ${data}`)
}
' "${backup}"

current_a=$(node -e '
const records = require(process.argv[1])
const apex = records.filter((r) => r.type === "A" && (r.name === "@" || r.name === ""))
console.log(apex.map((r) => r.data).join(","))
' "${backup}")

echo
echo "Planned changes:"
echo "  remove A @ records: ${current_a:-<none>}"
echo "  add    A @ ${APEX_IP}"
echo "  keep   all TXT, NS, CNAME and any other records"
echo

if [ "${CONFIRM:-}" != "yes" ]; then
  echo "Dry run. Re-run with CONFIRM=yes to apply."
  exit 0
fi

# GoDaddy's /records/A/@ endpoint replaces only that record set.
status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "${auth[@]}" -X DELETE "${API}/records/A/@" || true)
echo "delete A @ -> HTTP ${status}"

curl -fsS --max-time 20 "${auth[@]}" -X POST "${API}/records" \
  -d "[{\"type\":\"A\",\"name\":\"@\",\"data\":\"${APEX_IP}\",\"ttl\":${TTL}}]" > /dev/null
echo "added A @ ${APEX_IP}"

echo
echo "Waiting for public DNS to show the new record..."
for attempt in 1 2 3 4 5 6; do
  resolved=$(dig +short A "${DOMAIN}" @1.1.1.1 | tr '\n' ' ')
  echo "  attempt ${attempt}: ${resolved:-<empty>}"
  case " ${resolved} " in
    *" ${APEX_IP} "*) echo "DNS is live."; exit 0 ;;
  esac
  sleep 15
done

echo "Record applied but not yet visible from 1.1.1.1; propagation can take a few minutes."
echo "Rollback with the backup: CONFIRM=yes scripts/godaddy-restore-dns.sh ${backup}"
