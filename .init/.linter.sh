#!/bin/bash
cd /home/kavia/workspace/code-generation/furniro-e-commerce-platform-186157-186166/server_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

