#!/usr/bin/env bash
set -euo pipefail

WEB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(cd "${WEB_DIR}/../.." && pwd)"
TMP_ENV_FILE="$(mktemp "${TMPDIR:-/tmp}/siza-prod-env.XXXXXX")"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
ARTIFACT_ROOT="${WEB_DIR}/test-results/production/${RUN_ID}"
REPORT_ROOT="${WEB_DIR}/playwright-report/production/${RUN_ID}"
RUNTIME_PROBES_FILE="${ARTIFACT_ROOT}/runtime-probes.json"
SCOPE="${PROD_E2E_SCOPE:-all}"

cleanup() {
  rm -f "${TMP_ENV_FILE}"
}
trap cleanup EXIT

require_env() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "[ERROR] Missing required env: ${name}"
    exit 1
  fi
}

ensure_non_local_supabase() {
  local url="${NEXT_PUBLIC_SUPABASE_URL:-}"
  if [[ "${url}" == *"localhost"* || "${url}" == *"127.0.0.1"* ]]; then
    echo "[ERROR] NEXT_PUBLIC_SUPABASE_URL must be non-local for production audit."
    exit 1
  fi
}

ensure_generation_backend() {
  if [ -n "${MCP_GATEWAY_URL:-}" ] || [ -n "${GEMINI_API_KEY:-}" ] || [ -n "${OPENAI_API_KEY:-}" ] || [ -n "${ANTHROPIC_API_KEY:-}" ]; then
    return
  fi
  echo "[ERROR] Missing generation backend (set MCP_GATEWAY_URL or one AI provider key)."
  exit 1
}

resolve_service_role_key() {
  if [ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
    return
  fi

  local url="${NEXT_PUBLIC_SUPABASE_URL:-}"
  if [ -z "${url}" ]; then
    return
  fi

  local project_ref
  project_ref="$(echo "${url}" | sed -E 's#https?://([^.]+).*#\1#')"
  if [ -z "${project_ref}" ]; then
    return
  fi

  local resolved
  resolved="$(
    supabase projects api-keys --project-ref "${project_ref}" --output json 2>/dev/null \
      | jq -r '.[] | select(.name=="service_role") | .api_key // empty' \
      | head -n 1
  )"

  if [ -n "${resolved}" ]; then
    export SUPABASE_SERVICE_ROLE_KEY="${resolved}"
  fi
}

resolve_vercel_env_dir() {
  local common_git_dir
  common_git_dir="$(git -C "${REPO_DIR}" rev-parse --path-format=absolute --git-common-dir 2>/dev/null || true)"
  if [ -n "${common_git_dir}" ]; then
    local canonical_repo_dir
    canonical_repo_dir="$(cd "${common_git_dir}/.." && pwd)"
    if [ -f "${canonical_repo_dir}/.vercel/project.json" ]; then
      echo "${canonical_repo_dir}"
      return
    fi
  fi
  echo "${REPO_DIR}"
}

collect_issues_map() {
  local output_file="${ARTIFACT_ROOT}/issues-map.json"

  node --input-type=module <<'NODE'
import fs from 'node:fs';

const root = process.env.ARTIFACT_ROOT;
const probesFile = process.env.RUNTIME_PROBES_FILE;
const probePayload =
  probesFile && fs.existsSync(probesFile)
    ? JSON.parse(fs.readFileSync(probesFile, 'utf8'))
    : { results: [] };
const files = [
  `${root}/public/report.json`,
  `${root}/auth/report.json`,
].filter((file) => fs.existsSync(file));

function flattenSuites(suites, parentTitle = '', items = []) {
  for (const suite of suites || []) {
    const title = [parentTitle, suite.title].filter(Boolean).join(' > ');
    for (const test of suite.tests || []) {
      for (const result of test.results || []) {
        if (!['failed', 'timedOut', 'interrupted'].includes(result.status)) continue;
        items.push({
          title: [title, test.title].filter(Boolean).join(' > '),
          file: test.location?.file || suite.file || 'unknown',
          line: test.location?.line || suite.line || 1,
          error: result.error?.message || 'Unknown failure',
          attachments: (result.attachments || []).map((attachment) => attachment.path).filter(Boolean),
        });
      }
    }
    for (const spec of suite.specs || []) {
      const specTitle = [title, spec.title].filter(Boolean).join(' > ');
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          if (!['failed', 'timedOut', 'interrupted'].includes(result.status)) continue;
          items.push({
            title: specTitle,
            file: test.location?.file || spec.file || 'unknown',
            line: test.location?.line || spec.line || 1,
            error: result.error?.message || 'Unknown failure',
            attachments: (result.attachments || []).map((attachment) => attachment.path).filter(Boolean),
          });
        }
      }
    }
    flattenSuites(suite.suites || [], title, items);
  }
  return items;
}

const failures = [];
for (const file of files) {
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  failures.push(...flattenSuites(report.suites || []));
}

function mapFixTarget(failure) {
  const title = failure.title.toLowerCase();
  if (title.includes('roadmap has no horizontal overflow on mobile')) {
    return 'apps/web/src/components/roadmap/PhaseCard.tsx';
  }
  return failure.file;
}

const findings = failures.map((failure) => ({
  severity: failure.title.toLowerCase().includes('roadmap has no horizontal overflow on mobile')
    ? 'medium'
    : 'high',
  route_or_spec: failure.title,
  repro: `Run production audit and execute ${failure.file}:${failure.line}`,
  evidence: failure.attachments,
  root_cause: 'See failing assertion and trace attachment.',
  fix_target: mapFixTarget(failure),
  detail: failure.error,
}));

for (const probe of probePayload.results || []) {
  if (probe.passed) continue;
  findings.push({
    severity: probe.severity || 'high',
    route_or_spec: probe.route_or_spec,
    repro: probe.repro,
    evidence: ['runtime-probe'],
    root_cause: `Expected HTTP ${probe.expected} but received ${probe.actual}.`,
    fix_target: probe.fix_target,
    detail: probe.body,
  });
}

const payload = {
  generated_at: new Date().toISOString(),
  scope: process.env.SCOPE,
  findings,
  runtime_probes: probePayload.results || [],
};

fs.writeFileSync(`${root}/issues-map.json`, JSON.stringify(payload, null, 2));
NODE

  echo "[OK] Consolidated issue map: ${output_file}"
}

run_runtime_probes() {
  mkdir -p "${ARTIFACT_ROOT}"

  node --input-type=module <<'NODE'
import fs from 'node:fs';

const baseUrl = (process.env.PLAYWRIGHT_BASE_URL || 'https://siza.forgespace.co').replace(/\/$/, '');
const outputFile = process.env.RUNTIME_PROBES_FILE;

const probes = [
  {
    route_or_spec: 'GET /api/generations without auth',
    path: '/api/generations',
    expected: 401,
    severity: 'high',
    fix_target: 'apps/web/src/app/api/generations/route.ts',
  },
  {
    route_or_spec: 'GET /api/generations/history without auth',
    path: '/api/generations/history',
    expected: 401,
    severity: 'high',
    fix_target: 'apps/web/src/app/api/generations/history/route.ts',
  },
  {
    route_or_spec: 'GET /api/generations/[id] without auth',
    path: '/api/generations/nonexistent-id',
    expected: 401,
    severity: 'high',
    fix_target: 'apps/web/src/app/api/generations/[id]/route.ts',
  },
];

const results = [];

for (const probe of probes) {
  const url = `${baseUrl}${probe.path}`;
  let actual = 0;
  let body = '';

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    actual = response.status;
    body = (await response.text()).slice(0, 400);
  } catch (error) {
    actual = 0;
    body = String(error).slice(0, 400);
  }

  results.push({
    ...probe,
    repro: `curl ${url}`,
    actual,
    passed: actual === probe.expected,
    body,
  });
}

fs.writeFileSync(outputFile, JSON.stringify({ generated_at: new Date().toISOString(), results }, null, 2));
NODE

  echo "[OK] Runtime probes saved: ${RUNTIME_PROBES_FILE}"
}

run_pack() {
  local pack_name="$1"
  shift
  local specs=("$@")
  local output_dir="${ARTIFACT_ROOT}/${pack_name}"
  local report_dir="${REPORT_ROOT}/${pack_name}"
  local report_file="${output_dir}/report.json"

  mkdir -p "${output_dir}" "${report_dir}"

  export PLAYWRIGHT_PROD_OUTPUT_DIR="${output_dir}"
  export PLAYWRIGHT_PROD_REPORT_DIR="${report_dir}"
  export PLAYWRIGHT_PROD_REPORT_FILE="${report_file}"

  local playwright_bin="${WEB_DIR}/node_modules/.bin/playwright"
  if [ ! -x "${playwright_bin}" ]; then
    playwright_bin="${REPO_DIR}/node_modules/.bin/playwright"
  fi

  if [ ! -x "${playwright_bin}" ]; then
    echo "[ERROR] Playwright binary not found."
    exit 1
  fi

  set +e
  (cd "${WEB_DIR}" && "${playwright_bin}" test --config=playwright.production.config.ts --project=chromium "${specs[@]}")
  local status=$?
  set -e
  return "${status}"
}

VERCEL_ENV_DIR="$(resolve_vercel_env_dir)"
echo "[INFO] Pulling production env from Vercel (siza-web) via ${VERCEL_ENV_DIR}"
(cd "${VERCEL_ENV_DIR}" && npx vercel env pull "${TMP_ENV_FILE}" --environment=production --yes)

set -a
source "${TMP_ENV_FILE}"
set +a

require_env NEXT_PUBLIC_SUPABASE_URL
resolve_service_role_key
require_env SUPABASE_SERVICE_ROLE_KEY
ensure_non_local_supabase
ensure_generation_backend

export PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_PROD_BASE_URL:-https://siza.forgespace.co}"
export PLAYWRIGHT_PROD_BASE_URL="${PLAYWRIGHT_BASE_URL}"
export NEXT_PUBLIC_E2E_DISABLE_TOUR=true
export SIZA_LOCAL_AUTH_BYPASS=false
export SIZA_AGENT_LOCAL_FALLBACK=false
export ARTIFACT_ROOT
export RUNTIME_PROBES_FILE
export SCOPE

PUBLIC_SPECS=(
  e2e/landing.spec.ts
  e2e/marketing.spec.ts
  e2e/production-public-smoke.spec.ts
)

AUTH_SPECS=(
  e2e/lead-readiness.spec.ts
)

case "${SCOPE}" in
  all)
    STATUS=0
    run_pack "public" "${PUBLIC_SPECS[@]}" || STATUS=$?
    run_pack "auth" "${AUTH_SPECS[@]}" || STATUS=$?
    ;;
  public)
    STATUS=0
    run_pack "public" "${PUBLIC_SPECS[@]}" || STATUS=$?
    ;;
  auth)
    STATUS=0
    run_pack "auth" "${AUTH_SPECS[@]}" || STATUS=$?
    ;;
  *)
    echo "[ERROR] Invalid PROD_E2E_SCOPE: ${SCOPE} (use all|public|auth)"
    exit 1
    ;;
esac

run_runtime_probes
collect_issues_map
echo "[OK] Production E2E audit complete. Artifacts: ${ARTIFACT_ROOT}"
exit "${STATUS}"
