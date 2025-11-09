#!/bin/bash
# Run FastAPI server with increased size limits for large documents

uvicorn backend.app:app \
  --reload \
  --host 127.0.0.1 \
  --port 8000 \
  --limit-max-requests 10000 \
  --timeout-keep-alive 300 \
  --limit-concurrency 1000
