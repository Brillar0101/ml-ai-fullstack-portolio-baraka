# Extraction lab

A tiny harness for generating **real** before/after extraction examples for the
AI Engineering blog, so the posts show actual model behaviour instead of made-up
output. It sends a weak and a strong prompt to a local Ollama model and saves
what comes back.

## Requirements
- [Ollama](https://ollama.com) running locally with the model pulled:
  `ollama pull llama3.1:8b` (the API listens on `http://127.0.0.1:11434`).
- `pdftotext` (poppler) for text PDFs. On macOS: `brew install poppler`.
- `tesseract` only if you feed it a scanned image: `brew install tesseract`.

## Run
```bash
python3 run_extraction.py <document> prompts/<type>_weak.txt prompts/<type>_strong.txt
```
Example:
```bash
python3 run_extraction.py private/w9_sample.pdf prompts/w9_weak.txt prompts/w9_strong.txt
```
Outputs land in `outputs/`:
- `<doc>__text.txt`  the extracted document text (the real model input)
- `<doc>__weak.txt`  the model's answer to the vague prompt
- `<doc>__strong.txt` the model's answer to the constrained prompt

## Privacy
`private/` (real source documents) and `outputs/` (raw model responses) are
gitignored. Only redacted, license-clean material under `samples/` and the lab
code are committed. Use openly-licensed or sample documents; redact any
incidental PII before anything is published.
