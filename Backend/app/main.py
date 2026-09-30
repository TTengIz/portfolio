from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import engine, Base
from .routers import projects, contact, profile, upload

app = FastAPI(
    title="Portfolio API",
    description="API для портфолио разработчика",
    version="1.0.0",
)

# CORS - разрешаем всё для разработки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Статические файлы (загруженные изображения)
uploads_path = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Роутеры
app.include_router(projects.router)
app.include_router(contact.router)
app.include_router(profile.router)
app.include_router(upload.router)


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def root():
    return {
        "message": "Portfolio API is running",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}