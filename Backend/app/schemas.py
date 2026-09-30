from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# === Схемы для Education ===
class EducationBase(BaseModel):
    institution: str
    degree: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    description: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationResponse(EducationBase):
    id: int
    model_config = {"from_attributes": True}


# === Схемы для Experience ===
class ExperienceBase(BaseModel):
    company: str
    position: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    is_current: bool = False

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceResponse(ExperienceBase):
    id: int
    model_config = {"from_attributes": True}


# === Схемы для Profile ===
class ProfileBase(BaseModel):
    full_name: str
    age: Optional[int] = None
    photo_url: Optional[str] = None
    bio: str
    goals: Optional[str] = None
    contacts: Optional[str] = None

class ProfileCreate(ProfileBase):
    education: list[EducationCreate] = []
    experience: list[ExperienceCreate] = []

class ProfileUpdate(ProfileBase):
    education: Optional[list[EducationCreate]] = None
    experience: Optional[list[ExperienceCreate]] = None

class ProfileResponse(ProfileBase):
    id: int
    education: list[EducationResponse] = []
    experience: list[ExperienceResponse] = []
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# === Схемы для Project ===
class ProjectBase(BaseModel):
    title: str
    description: str
    tech_stack: str
    github_url: Optional[str] = None
    demo_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}


# === Схемы для Contact ===
class ContactMessageBase(BaseModel):
    name: str
    email: str
    message: str

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessageResponse(ContactMessageBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}