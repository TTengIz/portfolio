from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models import Profile, Education, Experience
from ..schemas import ProfileCreate, ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/profile", tags=["Profile"])

ADMIN_PASSWORD = "admin123"


async def verify_admin(x_admin_password: str = Header(default=None, alias="X-Admin-Password")):
    """Проверка пароля администратора."""
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin password"
        )
    return True


@router.get("/", response_model=ProfileResponse)
async def get_profile(db: AsyncSession = Depends(get_db)):
    """Получить профиль разработчика."""
    result = await db.execute(
        select(Profile)
        .options(selectinload(Profile.education), selectinload(Profile.experience))
        .order_by(Profile.id.desc())
        .limit(1)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile


@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
        profile_data: ProfileCreate,
        db: AsyncSession = Depends(get_db),
        admin: bool = Depends(verify_admin)
):
    """Создать профиль (требует пароль админа)."""
    result = await db.execute(select(Profile).limit(1))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists. Use PUT to update."
        )

    profile = Profile(
        full_name=profile_data.full_name,
        age=profile_data.age,
        photo_url=profile_data.photo_url,
        bio=profile_data.bio,
        goals=profile_data.goals,
        contacts=profile_data.contacts,
    )
    db.add(profile)
    await db.flush()

    for edu_data in profile_data.education:
        education = Education(profile_id=profile.id, **edu_data.model_dump())
        db.add(education)

    for exp_data in profile_data.experience:
        experience = Experience(
            profile_id=profile.id,
            is_current=int(exp_data.is_current),
            **{k: v for k, v in exp_data.model_dump().items() if k != 'is_current'}
        )
        db.add(experience)

    await db.commit()
    await db.refresh(profile)

    result = await db.execute(
        select(Profile)
        .options(selectinload(Profile.education), selectinload(Profile.experience))
        .where(Profile.id == profile.id)
    )
    return result.scalar_one()


@router.put("/", response_model=ProfileResponse)
async def update_profile(
        profile_data: ProfileUpdate,
        db: AsyncSession = Depends(get_db),
        admin: bool = Depends(verify_admin)
):
    """Обновить профиль (требует пароль админа)."""
    result = await db.execute(
        select(Profile)
        .options(selectinload(Profile.education), selectinload(Profile.experience))
        .limit(1)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    for key, value in profile_data.model_dump().items():
        if key not in ['education', 'experience'] and value is not None:
            setattr(profile, key, value)

    if profile_data.education is not None:
        for edu in profile.education:
            await db.delete(edu)
        await db.flush()

        for edu_data in profile_data.education:
            education = Education(profile_id=profile.id, **edu_data.model_dump())
            db.add(education)

    if profile_data.experience is not None:
        for exp in profile.experience:
            await db.delete(exp)
        await db.flush()

        for exp_data in profile_data.experience:
            experience = Experience(
                profile_id=profile.id,
                is_current=int(exp_data.is_current),
                **{k: v for k, v in exp_data.model_dump().items() if k != 'is_current'}
            )
            db.add(experience)

    await db.commit()
    await db.refresh(profile)

    result = await db.execute(
        select(Profile)
        .options(selectinload(Profile.education), selectinload(Profile.experience))
        .where(Profile.id == profile.id)
    )
    return result.scalar_one()