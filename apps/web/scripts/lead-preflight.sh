#!/usr/bin/env bash
# shellcheck disable=SC1090,SC2249,SC2292,SC2310
set -euo pipefail

WEB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "${WEB_DIR}/../.." && pwd)"
ENV_FILE="${WEB_DIR}/.env.local"

if [ ! -f "${ENV_FILE}" ]; then
  echo "[ERROR] Missing ${ENV_FILE}"
  exit 1
fi

load_env_if_exists() {
  local file="$1"
  if [ -f "${file}" ]; then
    set -a
    source "${file}"
    set +a
  fi
}

load_env_if_exists "${WEB_DIR}/.env"
load_env_if_exists "${ENV_FILE}"
load_env_if_exists "${ROOT_DIR}/.env"
load_env_if_exists "${ROOT_DIR}/.env.local"

unset NO_COLOR || true
unset FORCE_COLOR || true
export SIZA_LOCAL_AUTH_BYPASS=false
export SIZA_AGENT_LOCAL_FALLBACK="${SIZA_AGENT_LOCAL_FALLBACK:-true}"

sync_supabase_status_env() {
  local status_output
  status_output="$(cd "${ROOT_DIR}" && supabase status -o env 2>/dev/null)" || return 0

  local api_url anon_key publishable_key service_role_key mailpit_url generated_service_role_key
  api_url="$(echo "${status_output}" | sed -n 's/^API_URL=//p' | tail -n 1 | tr -d '"')"
  anon_key="$(echo "${status_output}" | sed -n 's/^ANON_KEY=//p' | tail -n 1 | tr -d '"')"
  publishable_key="$(echo "${status_output}" | sed -n 's/^PUBLISHABLE_KEY=//p' | tail -n 1 | tr -d '"')"
  service_role_key="$(echo "${status_output}" | sed -n 's/^SERVICE_ROLE_KEY=//p' | tail -n 1 | tr -d '"')"
  mailpit_url="$(echo "${status_output}" | sed -n 's/^MAILPIT_URL=//p' | tail -n 1 | tr -d '"')"

  if [ -n "${api_url}" ]; then
    export NEXT_PUBLIC_SUPABASE_URL="${api_url}"
  fi
  if [ -n "${publishable_key}" ]; then
    export NEXT_PUBLIC_SUPABASE_ANON_KEY="${publishable_key}"
  elif [ -n "${anon_key}" ]; then
    export NEXT_PUBLIC_SUPABASE_ANON_KEY="${anon_key}"
  fi
  if [ -n "${service_role_key}" ]; then
    export SUPABASE_SERVICE_ROLE_KEY="${service_role_key}"
  fi
  generated_service_role_key="$(cd "${WEB_DIR}" && \
    NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}" \
    SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-placeholder}" \
    NODE_NO_WARNINGS=1 node --input-type=module <<'NODE'
import { createAdminClient } from './e2e/helpers/admin-client.ts';
process.stdout.write(createAdminClient().supabaseKey ?? '');
NODE
  )"
  if [ -n "${generated_service_role_key}" ]; then
    export SUPABASE_SERVICE_ROLE_KEY="${generated_service_role_key}"
  fi
  if [ -n "${mailpit_url}" ]; then
    export MAILPIT_URL="${mailpit_url}"
  fi
}

ensure_local_supabase_url() {
  case "${NEXT_PUBLIC_SUPABASE_URL:-}" in
    http://127.0.0.1:* | http://localhost:* | https://127.0.0.1:* | https://localhost:*)
      return 0
      ;;
    *)
      echo "[ERROR] NEXT_PUBLIC_SUPABASE_URL must target local Supabase for lead validation."
      exit 1
      ;;
  esac
}

check_required_env() {
  local missing=0
  for name in NEXT_PUBLIC_SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY; do
    if [ -z "${!name:-}" ]; then
      echo "[ERROR] Missing required env: ${name}"
      missing=1
    fi
  done
  if [ "${missing}" -ne 0 ]; then
    exit 1
  fi
}

resolve_default_provider() {
  case "${DEFAULT_GENERATION_PROVIDER:-google}" in
    google | openai | anthropic)
      echo "${DEFAULT_GENERATION_PROVIDER:-google}"
      ;;
    *)
      echo "google"
      ;;
  esac
}

validate_google_key() {
  local status
  local body_file
  body_file="$(mktemp)"
  status="$(curl -sS --max-time 8 -o "${body_file}" -w "%{http_code}" \
    -H "x-goog-api-key: ${GEMINI_API_KEY}" \
    "https://generativelanguage.googleapis.com/v1beta/models" || true)"
  if [ "${status}" = "200" ]; then
    rm -f "${body_file}"
    return 0
  fi
  echo "[WARN] GEMINI_API_KEY failed validation (HTTP ${status})."
  rm -f "${body_file}"
  return 1
}

validate_openai_key() {
  local status
  local body_file
  body_file="$(mktemp)"
  status="$(curl -sS --max-time 8 -o "${body_file}" -w "%{http_code}" \
    -H "Authorization: Bearer ${OPENAI_API_KEY}" \
    "https://api.openai.com/v1/models" || true)"
  if [ "${status}" = "200" ]; then
    rm -f "${body_file}"
    return 0
  fi
  echo "[WARN] OPENAI_API_KEY failed validation (HTTP ${status})."
  rm -f "${body_file}"
  return 1
}

validate_anthropic_key() {
  local status
  local body_file
  body_file="$(mktemp)"
  status="$(curl -sS --max-time 8 -o "${body_file}" -w "%{http_code}" \
    -H "x-api-key: ${ANTHROPIC_API_KEY}" \
    -H "anthropic-version: 2023-06-01" \
    "https://api.anthropic.com/v1/models" || true)"
  if [ "${status}" = "200" ]; then
    rm -f "${body_file}"
    return 0
  fi
  echo "[WARN] ANTHROPIC_API_KEY failed validation (HTTP ${status})."
  rm -f "${body_file}"
  return 1
}

is_mcp_gateway_ready() {
  if [ -z "${MCP_GATEWAY_URL:-}" ]; then
    return 1
  fi

  local gateway_url
  local root_body
  local health_status
  gateway_url="${MCP_GATEWAY_URL%/}"
  root_body="$(curl -sS --max-time 4 "${gateway_url}" || true)"

  if echo "${root_body}" | grep -qi '"mode"[[:space:]]*:[[:space:]]*"minimal"'; then
    echo "[WARN] MCP gateway is in minimal mode and cannot be used for generation."
    return 1
  fi

  health_status="$(curl -sS --max-time 4 -o /dev/null -w "%{http_code}" \
    "${gateway_url}/health" || true)"
  if [ "${health_status}" = "200" ]; then
    return 0
  fi

  echo "[WARN] MCP gateway health check failed (HTTP ${health_status})."
  return 1
}

validate_server_provider_backend() {
  local provider
  provider="$(resolve_default_provider)"

  case "${provider}" in
    google)
      if [ -z "${GEMINI_API_KEY:-}" ]; then
        echo "[WARN] DEFAULT_GENERATION_PROVIDER=google requires GEMINI_API_KEY."
        return 1
      fi
      validate_google_key
      ;;
    openai)
      if [ -z "${OPENAI_API_KEY:-}" ]; then
        echo "[WARN] DEFAULT_GENERATION_PROVIDER=openai requires OPENAI_API_KEY."
        return 1
      fi
      validate_openai_key
      ;;
    anthropic)
      if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
        echo "[WARN] DEFAULT_GENERATION_PROVIDER=anthropic requires ANTHROPIC_API_KEY."
        return 1
      fi
      validate_anthropic_key
      ;;
  esac
}

has_siza_local_agent() {
  if [ "${SIZA_AGENT_LOCAL_FALLBACK:-false}" != "true" ]; then
    return 1
  fi

  (
    cd "${WEB_DIR}" && NODE_NO_WARNINGS=1 node --input-type=module <<'NODE'
try {
  await import('@forgespace/siza-gen');
  process.exit(0);
} catch {
  process.exit(1);
}
NODE
  )
}

check_generation_backend() {
  if is_mcp_gateway_ready; then
    echo "[OK] Generation backend ready via MCP gateway"
    return 0
  fi

  if validate_server_provider_backend; then
    echo "[OK] Generation backend ready via server provider"
    return 0
  fi

  if has_siza_local_agent; then
    echo "[OK] Generation backend ready via Siza local agent"
    return 0
  fi

  echo "[ERROR] Generation backend unavailable. Configure working MCP gateway or valid server AI key."
  exit 1
}

supabase_healthy() {
  local output
  output="$(cd "${ROOT_DIR}" && supabase status 2>&1)" || return 1
  if echo "${output}" | grep -q "local development setup is running"; then
    return 0
  fi
  return 1
}

check_supabase() {
  echo "[INFO] Checking Supabase status..."
  if supabase_healthy; then
    echo "[OK] Supabase is healthy"
    return
  fi

  echo "[WARN] Supabase unhealthy, running safe restart..."
  cd "${ROOT_DIR}"
  supabase stop || true
  supabase start

  echo "[INFO] Re-checking Supabase status..."
  if supabase_healthy; then
    echo "[OK] Supabase recovered"
    return
  fi

  echo "[ERROR] Supabase is still unhealthy after safe restart."
  exit 1
}

probe_marketplace_object() {
  local endpoint="$1"
  local label="$2"
  local api_key
  local body_file
  local status
  api_key="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-${SUPABASE_SERVICE_ROLE_KEY}}"
  body_file="$(mktemp)"

  status="$(curl -sS --max-time 8 -o "${body_file}" -w "%{http_code}" \
    -H "apikey: ${api_key}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${endpoint}" || true)"

  if [ "${status}" = "200" ] || [ "${status}" = "206" ]; then
    rm -f "${body_file}"
    return 0
  fi

  local body
  body="$(cat "${body_file}")"
  rm -f "${body_file}"
  echo "[WARN] Marketplace schema check failed for ${label} (HTTP ${status}): ${body}"
  return 1
}

check_marketplace_schema() {
  local missing=()

  if ! probe_marketplace_object "plugins?select=id&limit=1" "public.plugins"; then
    missing+=("public.plugins")
  fi
  if ! probe_marketplace_object "plugin_installations?select=id&limit=1" \
    "public.plugin_installations"; then
    missing+=("public.plugin_installations")
  fi
  if ! probe_marketplace_object "generations?select=is_featured&limit=1" \
    "public.generations.is_featured"; then
    missing+=("public.generations.is_featured")
  fi

  if [ "${#missing[@]}" -eq 0 ]; then
    echo "[OK] Marketplace schema preflight passed"
    return
  fi

  echo "[WARN] Missing marketplace DB objects. Running safe migration forward..."
  cd "${ROOT_DIR}"
  supabase migration up

  local unresolved=()
  if ! probe_marketplace_object "plugins?select=id&limit=1" "public.plugins"; then
    unresolved+=("public.plugins")
  fi
  if ! probe_marketplace_object "plugin_installations?select=id&limit=1" \
    "public.plugin_installations"; then
    unresolved+=("public.plugin_installations")
  fi
  if ! probe_marketplace_object "generations?select=is_featured&limit=1" \
    "public.generations.is_featured"; then
    unresolved+=("public.generations.is_featured")
  fi

  if [ "${#unresolved[@]}" -ne 0 ]; then
    echo "[ERROR] Marketplace schema still mismatched after migration: ${unresolved[*]}"
    exit 1
  fi

  echo "[OK] Marketplace schema recovered via migration"
}

check_supabase
sync_supabase_status_env
check_required_env
ensure_local_supabase_url
check_marketplace_schema
check_generation_backend
echo "[OK] Lead preflight passed"
