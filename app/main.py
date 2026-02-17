import base64
import os
from typing import Literal

from fastapi import FastAPI, File, HTTPException, UploadFile  
from pydantic import BaseModel, Field  
from openai import OpenAI

app = FastAPI(
    title="Tech Issue AI",
    description="AI assistant for diagnosing software and hardware issues from text and images.",
    version="1.0.0",
)


class IssueRequest(BaseModel):
    issue_type: Literal["software", "hardware", "unknown"] = Field(
        default="unknown", description="Known issue category if user already knows it."
    )
    device: str = Field(..., description="Device, OS, and version details.")
    symptoms: str = Field(..., description="What is happening and when.")
    recent_changes: str = Field(
        default="None", description="Updates, installs, impacts, spills, drops, etc."
    )


class IssueResponse(BaseModel):
    classification: str
    likely_causes: list[str]
    quick_checks: list[str]
    next_steps: list[str]
    escalation: str


def get_client() -> OpenAI:
    api_key = os.getenv("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")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured.")
    return OpenAI(api_key=api_key)


SYSTEM_PROMPT = (
    "You are a senior IT support engineer. Diagnose both software and hardware problems. "
    "Always return practical, safe, step-by-step troubleshooting. "
    "Prioritize data safety, warranty safety, and minimal-risk checks first. "
    "If uncertain, say so and give tests that reduce uncertainty."
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=IssueResponse)
def analyze_issue(request: IssueRequest) -> IssueResponse:
    client = get_client()

    prompt = f"""
Issue type hint: {request.issue_type}
Device details: {request.device}
Symptoms: {request.symptoms}
Recent changes: {request.recent_changes}

Return JSON with keys:
- classification (software/hardware/mixed/unknown)
- likely_causes (array of strings)
- quick_checks (array of strings)
- next_steps (array of strings)
- escalation (string)
"""

    completion = client.chat.completions.create(
        model=os.getenv("TEXT_MODEL", "gpt-4o-mini"),
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )

    content = completion.choices[0].message.content
    if not content:
        raise HTTPException(status_code=502, detail="Model returned empty response.")

    return IssueResponse.model_validate_json(content)


@app.post("/analyze-image", response_model=IssueResponse)
async def analyze_issue_from_image(
    image: UploadFile = File(...),
    context: str = "",
) -> IssueResponse:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload must be an image file.")

    client = get_client()
    image_bytes = await image.read()
    encoded = base64.b64encode(image_bytes).decode("utf-8")

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "Read this image for technical issue evidence (error codes, LEDs, damage, BIOS, "
                        "logs, stack traces, device manager, etc.) and diagnose root causes. "
                        f"Additional user context: {context or 'None'}\n"
                        "Return JSON with keys: classification, likely_causes, quick_checks, next_steps, escalation."
                    ),
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{image.content_type};base64,{encoded}"},
                },
            ],
        },
    ]

    completion = client.chat.completions.create(
        model=os.getenv("VISION_MODEL", "gpt-4o-mini"),
        response_format={"type": "json_object"},
        messages=messages,
        temperature=0.2,
    )

    content = completion.choices[0].message.content
    if not content:
        raise HTTPException(status_code=502, detail="Model returned empty response.")

    return IssueResponse.model_validate_json(content)
