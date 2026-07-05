#!/usr/bin/env bash
# PreToolUse hook: block edits to secret files and obvious secret leakage.
# Exit code 2 tells Claude Code to block the tool call.
set -euo pipefail

input="$(cat)"
file="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)"

case "$file" in
  *.env|*.env.*|*service-account*.json|*serviceAccount*.json)
    echo "⛔ Refusing to write to a secrets file ($file). Use env vars; never commit secrets." >&2
    exit 2
    ;;
esac
exit 0
