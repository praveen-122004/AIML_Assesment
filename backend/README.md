# Backend

This folder contains a minimal FastAPI skeleton and parser stubs for DOCX/PDF.

How to run (example):

1. Create a virtual environment and install dependencies:

   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

2. Run the app:

   uvicorn app:app --reload --host 127.0.0.1 --port 8000

Endpoints:
- GET /health - simple health check
- POST /upload - accepts a file upload (parser not implemented in skeleton)
