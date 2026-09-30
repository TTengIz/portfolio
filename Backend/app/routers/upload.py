import os
import uuid
from pathlib import Path

from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter(prefix="/upload", tags=["Upload"])

# Путь к папке uploads
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@router.post("/image/")
async def upload_image(file: UploadFile = File(...)):
    """Загрузить изображение."""
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Разрешены только JPG, PNG и WEBP"
        )

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename

    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    return {
        "filename": unique_filename,
        "url": f"/static/uploads/{unique_filename}"
    }