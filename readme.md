# Tech Issue AI (Software + Hardware + Image Reader)

This project provides a lightweight API that can:

- Diagnose **software** issues
- Diagnose **hardware** issues
- Diagnose issues from an **uploaded image** (error screen, broken part photo, BIOS screen, device manager screenshot, etc.)

## Features

- `POST /analyze` for text-only issue triage
- `POST /analyze-image` for image-based diagnostics
- Structured JSON response:
  - classification
  - likely causes
  - quick checks
  - next steps
  - escalation advice

## Requirements

- Python 3.10+
- `OPENAI_API_KEY`

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY="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"
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Test the API

### 1) Text-based issue

```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "issue_type": "unknown",
    "device": "Dell XPS 13, Windows 11 23H2",
    "symptoms": "Laptop freezes 2-3 minutes after startup and fan gets loud",
    "recent_changes": "Installed GPU driver update yesterday"
  }'
```

### 2) Image-based issue

```bash
curl -X POST "http://127.0.0.1:8000/analyze-image" \
  -F "image=@./example-error-screen.jpg" \
  -F "context=This appeared after a BIOS update"
```

## Notes

- For hardware troubleshooting, the assistant is instructed to prioritize low-risk and warranty-safe checks.
- You can set model names with:
  - `TEXT_MODEL` (default `gpt-4o-mini`)
  - `VISION_MODEL` (default `gpt-4o-mini`)
