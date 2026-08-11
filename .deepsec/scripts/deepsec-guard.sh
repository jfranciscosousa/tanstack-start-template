#!/usr/bin/env bash
set -euo pipefail

workspace_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
config_file="$workspace_dir/deepsec.config.ts"
env_file="$workspace_dir/.env.local"
gateway_host="ai-gateway.vercel.sh"

fail() {
  printf 'Deepsec blocked: %s\n' "$1" >&2
  exit 1
}

if [[ -n "${VERCEL_OIDC_TOKEN:-}" ]]; then
  fail "VERCEL_OIDC_TOKEN is set and Deepsec can convert it into an AI Gateway credential."
fi

if [[ -n "${AI_GATEWAY_API_KEY:-}" ]]; then
  fail "AI_GATEWAY_API_KEY is set."
fi

if [[ "${OPENAI_BASE_URL:-}" == *"$gateway_host"* ]]; then
  fail "OPENAI_BASE_URL points to Vercel AI Gateway."
fi

if [[ "${ANTHROPIC_BASE_URL:-}" == *"$gateway_host"* ]]; then
  fail "ANTHROPIC_BASE_URL points to Vercel AI Gateway."
fi

if [[ -f "$env_file" ]] && grep -Eq '^[[:space:]]*(VERCEL_OIDC_TOKEN|AI_GATEWAY_API_KEY)[[:space:]]*=' "$env_file"; then
  fail ".env.local contains a Vercel AI Gateway credential."
fi

if [[ -f "$env_file" ]] && grep -Eq "$gateway_host" "$env_file"; then
  fail ".env.local contains a Vercel AI Gateway URL."
fi

if [[ -f "$config_file" ]] && grep -Eq "mode[[:space:]]*:[[:space:]]*[\"']gateway[\"']" "$config_file"; then
  fail "deepsec.config.ts configures an AI Gateway route."
fi

unset VERCEL_OIDC_TOKEN AI_GATEWAY_API_KEY
exec "$workspace_dir/node_modules/.bin/deepsec" "$@"
