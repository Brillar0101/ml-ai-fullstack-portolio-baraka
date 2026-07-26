#!/bin/sh
# Run a verification script with Vite-style module resolution.
exec node --no-warnings --import ./scripts/register-hook.mjs "$@"
