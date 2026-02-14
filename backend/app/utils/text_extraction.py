import chardet
import fitz  # PyMuPDF


def extract_text_from_txt(filepath: str) -> str:
    with open(filepath, "rb") as f:
        raw = f.read()
    detected = chardet.detect(raw)
    encoding = detected.get("encoding", "utf-8") or "utf-8"
    return raw.decode(encoding, errors="replace")


def extract_text_from_pdf(filepath: str) -> str:
    doc = fitz.open(filepath)
    pages = []
    for page in doc:
        pages.append(page.get_text())
    doc.close()
    return "\n\n".join(pages)


def extract_text(filepath: str, file_type: str) -> str:
    if file_type == "pdf":
        return extract_text_from_pdf(filepath)
    elif file_type == "txt":
        return extract_text_from_txt(filepath)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")
