#!/usr/bin/env python3
"""
Run the FastAPI server with configuration for large file uploads
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "backend.app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        limit_max_requests=10000,
        timeout_keep_alive=300,
        # This is the key setting for large form data
        h11_max_incomplete_event_size=50 * 1024 * 1024,  # 50MB
    )
