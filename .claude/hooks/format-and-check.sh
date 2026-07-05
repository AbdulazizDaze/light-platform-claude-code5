#!/usr/bin/env bash
# PostToolUse hook: format the file that was just written/edited, then a quick TS check.
# Receives Claude Code hook JSON on stdin; we extract the edited file path.
set -euo pipefail

input="$(cat)"
file="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)"

# Only act on source files inside the repo.
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md) : ;;
  *) exit 0 ;;
esac

# Format with Prettier if available (never fail the tool call on formatting issues).
if command -v npx >/dev/null 2>&1 && [ -f "package.json" ]; then
  npx --no-install prettier --write "$file" >/dev/null 2>&1 || true
fi

# Lightweight, non-blocking TypeScript signal for .ts/.tsx edits.
case "$file" in
  *.ts|*.tsx)
    if command -v npx >/dev/null 2>&1 && [ -f "tsconfig.json" ]; then
      if ! npx --no-install tsc --noEmit >/tmp/light_tsc.log 2>&1; then
        echo "⚠️  typecheck reported errors after editing $file (run: npm run typecheck)" >&2
      fi
    fi
    ;;
esac
exit 0
