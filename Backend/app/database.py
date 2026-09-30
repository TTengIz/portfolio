from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Настройки приложения, загружаются из .env файла."""

    DATABASE_URL: str

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # В продакшене ставим False, чтобы не спамить в логи
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Базовый класс для всех моделей."""
    pass


async def get_db():
    """Зависимость FastAPI для получения сессии БД."""
    async with AsyncSessionLocal() as session:
        yield session