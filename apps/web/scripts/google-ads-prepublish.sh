#!/usr/bin/env bash
# shellcheck disable=SC2250
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[INFO] Running lead preflight gate"
npm run test:e2e:lead:preflight

echo "[INFO] Running template funnel smoke gate"
LEAD_E2E_SPECS="e2e/marketplace.spec.ts" npm run test:e2e:lead:chromium

echo "[OK] Local pre-publish gates passed"
echo "[MANUAL] GA4 DebugView: verify one UTM-tagged signup emits lead_signup_success"
echo "[MANUAL] Google Ads: imported GA4 lead_signup_success set as Primary conversion"
