# 📦 ai-ml-assignment - Web Document Editor

A full-stack web application for parsing, editing, and exporting documents (.docx and .pdf files).

## 🎯 Features

✅ **Upload** large .docx or .pdf files  
✅ **Parse** and extract:
  - Text content
  - Tables (with formatting)
  - Images (as base64 embedded)
✅ **Display** in dual-mode editor:
  - HTML View: Rendered rich text with formatting
  - Plain Text View: Raw text for precise editing
✅ **Edit** content directly in the browser  
✅ **Export** section-wise JSON with structured data

## 🏗️ Architecture

```
+---------------------------+           +------------------------+
|     FRONTEND (HTML/JS)    |           |    BACKEND (FastAPI)   |
|---------------------------|           |------------------------|
| HTML/CSS + Vanilla JS     | <-------> | FastAPI (Python)       |
| Upload Button             |   REST    | DOCX Parser            |
| Dual-Mode Editor          |   API     | PDF Parser             |
| Export Button             |  (JSON)   | Section Extractor      |
+---------------------------+           +------------------------+
```

## 📁 Project Structure

```
ai-ml-assignment/
├── backend/
│   ├── app.py                    # FastAPI main application
│   ├── parsers/
│   │   ├── docx_parser.py        # Extract from DOCX (python-docx)
│   │   └── pdf_parser.py         # Extract from PDF (PyMuPDF, pdfplumber)
│   ├── utils/
│   │   └── section_extractor.py  # Detect sections/subsections
│   ├── requirements.txt          # Python dependencies
│   └── README.md
├── frontend/
│   ├── index.html                # Main UI
│   ├── scripts.js                # Client-side logic
│   ├── styles.css                # Styling
│   └── README.md
├── demo/
│   ├── sample_document.docx      # Test file (placeholder)
│   ├── sample_document.pdf       # Test file (placeholder)
│   └── sample_output.json        # Example output
└── README.md                     # This file

```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Application

```bash
# From project root
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

### 3. Open in Browser

Navigate to: **http://127.0.0.1:8000**

## 🔧 API Endpoints

- `GET /` - Serves the frontend application
- `POST /api/upload` - Upload and parse document (accepts .docx or .pdf)
- `POST /api/export_json` - Export edited content as section-wise JSON

## 📝 Usage

1. **Upload**: Click "Choose File" and select a .docx or .pdf document
2. **View**: Toggle between "HTML View" (formatted) or "Plain Text View" (raw)
3. **Edit**: Make changes directly in the editor
4. **Export**: Click "Export JSON" to download structured output

## 🛠️ Technology Stack

**Backend:**
- FastAPI - Web framework
- python-docx - DOCX parsing
- PyMuPDF (fitz) - PDF text/image extraction
- pdfplumber - PDF table extraction
- BeautifulSoup4 - HTML parsing for section extraction

**Frontend:**
- Vanilla JavaScript (ES6+)
- HTML5 with contenteditable
- CSS3

## 📦 Dependencies

See `backend/requirements.txt` for full list:
- fastapi>=0.104.0
- uvicorn[standard]>=0.24.0
- python-docx>=1.0.0
- PyMuPDF>=1.23.0
- pdfplumber>=0.10.0
- beautifulsoup4>=4.12.0
- Pillow>=10.0.0

## 🔍 How It Works

1. **Upload**: Frontend sends file to `/api/upload` endpoint
2. **Parse**: Backend detects file type and routes to appropriate parser
3. **Extract**: Parsers extract text, tables, and images as HTML
4. **Display**: Frontend renders HTML in contenteditable div or textarea
5. **Edit**: User can modify content directly
6. **Export**: Section extractor analyzes HTML structure and generates JSON

## 🎨 Section Extraction Logic

The section extractor (`backend/utils/section_extractor.py`) identifies sections by:
- HTML heading tags (h1, h2)
- Numbered patterns (1.0, 1.1, 2.0, etc.)
- Groups content under detected headings

## 🧪 Testing

Replace placeholder files in `demo/` with real documents:
- `sample_document.docx` - Real Word document
- `sample_document.pdf` - Real PDF file

Then upload through the web interface.

## 📄 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- Better section detection algorithms
- Support for more file formats
- Advanced rich text editor integration (Quill.js, TinyMCE)
- Document format preservation
- Batch processing

---

**Status**: ✅ Fully functional and tested!

