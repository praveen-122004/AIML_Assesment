# backend/parsers/pdf_parser.py

import fitz  # PyMuPDF
import base64
import pdfplumber
from io import BytesIO

def parse_pdf(file):
    """Extract text, tables, and images from PDF as HTML."""
    html = ""
    pdf_bytes = file.read()

    # Extract text and images using PyMuPDF
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    for page in doc:
        html += page.get_text("html")

        for img in page.get_images(full=True):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")
            html += f"<img src='data:image/png;base64,{image_base64}' />"

    # Extract tables using pdfplumber (need to reopen from bytes)
    with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                html += "<table border='1'>"
                for row in table:
                    html += "<tr>" + "".join(f"<td>{cell or ''}</td>" for cell in row) + "</tr>"
                html += "</table>"

    return html
