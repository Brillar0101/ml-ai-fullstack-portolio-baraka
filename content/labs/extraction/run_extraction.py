#!/usr/bin/env python3
"""
Reusable document-extraction lab.

Reads a document's text, sends a "weak" and a "strong" extraction prompt to a
local Ollama model, and saves the raw outputs. Used to generate the REAL
before/after examples in the AI Engineering blog posts, so claims about model
behaviour are grounded in actual runs rather than invented.

Text source by file type:
  .txt   -> read directly
  .pdf   -> pdftotext (poppler)      [text PDFs]
  image  -> tesseract if installed   [scanned docs]

Usage:
  python3 run_extraction.py <document> <weak_prompt.txt> <strong_prompt.txt>

Each prompt file may contain a {document} placeholder; if absent, the document
text is appended under a "Document:" header. Outputs are written to outputs/.
Nothing here is network-facing except the local Ollama call on 127.0.0.1:11434.
"""
import json
import os
import subprocess
import sys
import urllib.request

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "llama3.1:8b"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "outputs")

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".webp"}


def read_document(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".txt":
        with open(path, encoding="utf-8", errors="replace") as f:
            return f.read()
    if ext == ".pdf":
        # -layout keeps columns/rows roughly aligned, closer to what a human sees
        text = subprocess.run(
            ["pdftotext", "-layout", path, "-"],
            capture_output=True, text=True, check=True,
        ).stdout
        # Image-only (scanned) PDFs have no text layer: rasterize then OCR.
        if len(text.strip()) >= 20:
            return text
        return ocr_pdf(path)
    if ext in IMAGE_EXTS:
        return ocr_image(path)
    sys.exit(f"unsupported file type: {ext}")


def _require_tesseract():
    if subprocess.run(["which", "tesseract"], capture_output=True).returncode != 0:
        sys.exit("tesseract is not installed; run: brew install tesseract")


def ocr_image(path):
    _require_tesseract()
    return subprocess.run(
        ["tesseract", path, "-"], capture_output=True, text=True, check=True,
    ).stdout


def ocr_pdf(path):
    _require_tesseract()
    if subprocess.run(["which", "pdftoppm"], capture_output=True).returncode != 0:
        sys.exit("pdftoppm not found; run: brew install poppler")
    import glob
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        prefix = os.path.join(tmp, "page")
        subprocess.run(["pdftoppm", "-r", "200", "-png", path, prefix], check=True)
        pages = sorted(glob.glob(prefix + "*.png"))
        texts = [
            subprocess.run(["tesseract", p, "-"], capture_output=True, text=True, check=True).stdout
            for p in pages
        ]
        return "\n".join(texts)


def call_ollama(prompt):
    body = json.dumps({
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0},  # deterministic, so examples reproduce
    }).encode()
    req = urllib.request.Request(OLLAMA_URL, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.loads(resp.read())["response"]


def build_prompt(template, document):
    if "{document}" in template:
        return template.replace("{document}", document)
    return f"{template.rstrip()}\n\nDocument:\n{document}"


def main():
    if len(sys.argv) != 4:
        sys.exit("usage: python3 run_extraction.py <document> <weak_prompt.txt> <strong_prompt.txt>")
    doc_path, weak_path, strong_path = sys.argv[1:4]
    os.makedirs(OUT_DIR, exist_ok=True)

    document = read_document(doc_path)
    stem = os.path.splitext(os.path.basename(doc_path))[0]

    # Save the extracted text too, so we can show the real model input.
    with open(os.path.join(OUT_DIR, f"{stem}__text.txt"), "w", encoding="utf-8") as f:
        f.write(document)

    for label, prompt_path in (("weak", weak_path), ("strong", strong_path)):
        with open(prompt_path, encoding="utf-8") as f:
            template = f.read()
        print(f"\n===== {label.upper()} PROMPT =====")
        output = call_ollama(build_prompt(template, document))
        print(output)
        out_file = os.path.join(OUT_DIR, f"{stem}__{label}.txt")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(output)
        print(f"[saved -> {os.path.relpath(out_file, HERE)}]")


if __name__ == "__main__":
    main()
