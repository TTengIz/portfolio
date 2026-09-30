from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import ContactMessage
from ..schemas import ContactMessageCreate, ContactMessageResponse

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("/", response_model=ContactMessageResponse, status_code=201)
async def send_message(message: ContactMessageCreate, db: AsyncSession = Depends(get_db)):
    """Отправить сообщение через форму обратной связи."""
    db_message = ContactMessage(**message.model_dump())
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)

    # TODO: Добавить отправку уведомления в Telegram/Email
    # await send_notification(db_message)

    return db_message