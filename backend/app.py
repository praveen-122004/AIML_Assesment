# backend/app.py

from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import mimetypes
import os

from backend.parsers.docx_parser import parse_docx
from backend.parsers.pdf_parser import parse_pdf
from backend.utils.section_extractor import extract_sections


app = FastAPI(title="Web Document Editor")

# Allow frontend to access backend (CORS)

# allow only your frontend origin (replace if your Vercel URL is different)
FRONTEND_ORIGIN = "https://aimlassesment.vercel.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)




# ===== API ROUTES (MUST BE DEFINED BEFORE StaticFiles MOUNT) =====

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Accept a file and return HTML content extracted from it."""
    mime_type = mimetypes.guess_type(file.filename)[0]

    try:
        if mime_type == "application/pdf":
            html_content = parse_pdf(file.file)
        elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            html_content = parse_docx(file.file)
        else:
            return JSONResponse({"error": "Unsupported file format"}, status_code=400)
        # Also compute sections so frontend can render sidebar
        sections = extract_sections(html_content)
        return {"content": html_content, "sections": sections}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/api/export_json")
async def export_json(request: Request):
    """Take edited HTML and return section-wise JSON. Accepts JSON body instead of form-data."""
    try:
        # Read JSON body directly to avoid form-data size limits
        body = await request.json()
        html = body.get("html", "")
        
        if not html:
            return JSONResponse({"error": "No HTML content provided"}, status_code=400)
        
        sections = extract_sections(html)
        return JSONResponse(sections)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# ===== SERVE FRONTEND (MUST BE LAST) =====

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

# Alias routes for convenience (mirror /api/*)
@app.post("/upload")
async def upload_alias(file: UploadFile = File(...)):
    return await upload_file(file)

@app.post("/export_json")
async def export_alias(request: Request):
    return await export_json(request)

