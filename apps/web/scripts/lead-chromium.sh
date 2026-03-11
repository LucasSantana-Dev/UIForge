#!/usr/bin/env bash
# shellcheck disable=SC1090,SC2086,SC2292
set -euo pipefail

WEB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "${WEB_DIR}/../.." && pwd)"
ENV_FILE="${WEB_DIR}/.env.local"
PRECHECK="${WEB_DIR}/scripts/lead-preflight.sh"

bash "${PRECHECK}"

if [[ ! -f "${ENV_FILE}" ]]; then
	echo "[ERROR] Missing ${ENV_FILE}"
	exit 1
fi

load_env_if_exists() {
	local file="$1"
	if [[ -f "${file}" ]]; then
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
export PLAYWRIGHT_WEB_PORT="${PLAYWRIGHT_WEB_PORT:-3110}"
export PLAYWRIGHT_REUSE_SERVER=false

release_next_dev_lock() {
	if [[ "${PLAYWRIGHT_REUSE_SERVER}" == "true" ]]; then
		return
	fi

	local lock_file="${WEB_DIR}/.next/dev/lock"
	if [[ ! -f "${lock_file}" ]]; then
		return
	fi

	local lock_holders
	lock_holders="$(lsof -t "${lock_file}" 2>/dev/null | tr '\n' ' ' || true)"
	if [[ -n "${lock_holders// /}" ]]; then
		echo "[WARN] Releasing Next dev lock from PID(s): ${lock_holders}"
		kill ${lock_holders} 2>/dev/null || true
		sleep 1
	fi

	rm -f "${lock_file}" 2>/dev/null || true
}

sync_supabase_status_env() {
	local status_output
	status_output="$(cd "${ROOT_DIR}" && supabase status -o env 2>/dev/null)" || return 0

	local api_url anon_key publishable_key service_role_key mailpit_url generated_service_role_key
	api_url="$(echo "${status_output}" | sed -n 's/^API_URL=//p' | tail -n 1 | tr -d '"')"
	anon_key="$(echo "${status_output}" | sed -n 's/^ANON_KEY=//p' | tail -n 1 | tr -d '"')"
	publishable_key="$(echo "${status_output}" | sed -n 's/^PUBLISHABLE_KEY=//p' | tail -n 1 | tr -d '"')"
	service_role_key="$(echo "${status_output}" | sed -n 's/^SERVICE_ROLE_KEY=//p' | tail -n 1 | tr -d '"')"
	mailpit_url="$(echo "${status_output}" | sed -n 's/^MAILPIT_URL=//p' | tail -n 1 | tr -d '"')"

	if [[ -n "${api_url}" ]]; then
		export NEXT_PUBLIC_SUPABASE_URL="${api_url}"
	fi
	if [[ -n "${publishable_key}" ]]; then
		export NEXT_PUBLIC_SUPABASE_ANON_KEY="${publishable_key}"
	elif [[ -n "${anon_key}" ]]; then
		export NEXT_PUBLIC_SUPABASE_ANON_KEY="${anon_key}"
	fi
	if [[ -n "${service_role_key}" ]]; then
		export SUPABASE_SERVICE_ROLE_KEY="${service_role_key}"
	fi
	generated_service_role_key="$(
		cd "${WEB_DIR}" &&
			NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}" \
				SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-placeholder}" \
				NODE_NO_WARNINGS=1 node --input-type=module <<'NODE'
import { createAdminClient } from './e2e/helpers/admin-client.ts';
process.stdout.write(createAdminClient().supabaseKey ?? '');
NODE
	)"
	if [[ -n "${generated_service_role_key}" ]]; then
		export SUPABASE_SERVICE_ROLE_KEY="${generated_service_role_key}"
	fi
	if [[ -n "${mailpit_url}" ]]; then
		export MAILPIT_URL="${mailpit_url}"
	fi
}

sync_supabase_status_env
release_next_dev_lock

cd "${WEB_DIR}"

PLAYWRIGHT_BIN="${WEB_DIR}/node_modules/.bin/playwright"
if [[ ! -x "${PLAYWRIGHT_BIN}" ]]; then
	PLAYWRIGHT_BIN="${ROOT_DIR}/node_modules/.bin/playwright"
fi
if [[ ! -x "${PLAYWRIGHT_BIN}" ]]; then
	echo "[ERROR] Missing Playwright CLI in workspace node_modules/.bin"
	exit 1
fi

DEFAULT_SPECS=(
	e2e/lead-readiness.spec.ts
	e2e/auth.spec.ts
	e2e/onboarding.spec.ts
	e2e/projects.spec.ts
	e2e/generation.spec.ts
	e2e/navigation.spec.ts
	e2e/settings.spec.ts
	e2e/billing.spec.ts
)

if [[ -n "${LEAD_E2E_SPECS:-}" ]]; then
	# Space-delimited spec list override for targeted lead-critical reruns.
	read -r -a SELECTED_SPECS <<<"${LEAD_E2E_SPECS}"
else
	SELECTED_SPECS=("${DEFAULT_SPECS[@]}")
fi

"${PLAYWRIGHT_BIN}" test --project=chromium \
	--workers=1 \
	"${SELECTED_SPECS[@]}" \
	"$@"
