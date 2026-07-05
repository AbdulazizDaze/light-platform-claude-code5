#!/usr/bin/env bash
# PostToolUse reminder when security-sensitive files change.
set -euo pipefail
input="$(cat)"
file="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)"
case "$file" in
  *firestore.rules|*firestore.indexes.json|*/lib/firebase/*|*/api/*)
    echo "🔐 $file changed — run the security-reviewer gate before shipping (auth/rules/PII)." >&2
    ;;
esac
exit 0
