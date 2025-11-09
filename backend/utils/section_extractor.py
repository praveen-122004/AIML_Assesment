# backend/utils/section_extractor.py

from bs4 import BeautifulSoup
import re

def extract_sections(html_content: str):
    """Split HTML into sections based on headings (h1, h2, h3) or numbered patterns.
    Returns an ordered dict (insertion order preserved in Python 3.7+) mapping
    section title -> aggregated inner HTML (excluding the heading itself).
    """
    soup = BeautifulSoup(html_content, "html.parser")
    sections = {}
    current_heading = "General"

    # Include h3 for subsection support; images, tables, paragraphs grouped under last heading.
    for tag in soup.find_all(["h1", "h2", "h3", "p", "table", "img"]):
        text = (tag.text or "").strip()
        # Detect new section heading by tag name OR numbered pattern (e.g., 1, 1.1, 2.3.4)
        if tag.name in ["h1", "h2", "h3"] or re.match(r"^\d+(\.\d+)*", text):
            current_heading = text or "Untitled Section"
            # Initialize empty collector (we exclude the heading tag itself)
            sections[current_heading] = ""
        else:
            sections.setdefault(current_heading, "")
            sections[current_heading] += str(tag)

    return sections

def extract_section_list(html_content: str):
    """Return a list of section metadata preserving order with level info.
    Each item: {"title": str, "level": int, "content": str}
    Level determined by heading tag (h1->1, h2->2, h3->3) or depth of numeric pattern.
    """
    soup = BeautifulSoup(html_content, "html.parser")
    result = []
    current = None
    for tag in soup.find_all(["h1", "h2", "h3", "p", "table", "img"]):
        text = (tag.text or "").strip()
        if tag.name in ["h1", "h2", "h3"] or re.match(r"^\d+(\.\d+)*", text):
            level = 1
            if tag.name in ["h2"]: level = 2
            elif tag.name in ["h3"]: level = 3
            elif re.match(r"^\d+(\.\d+)*", text):
                # Numeric pattern: depth = count of dots + 1
                level = text.count(".") + 1
            current = {"title": text or "Untitled Section", "level": level, "content": ""}
            result.append(current)
        else:
            if current is None:
                current = {"title": "General", "level": 0, "content": ""}
                result.append(current)
            current["content"] += str(tag)
    return result
