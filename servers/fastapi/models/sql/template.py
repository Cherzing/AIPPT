from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column, DateTime, String
from sqlmodel import Field, SQLModel

from utils.datetime_utils import get_current_utc_datetime


class TemplateModel(SQLModel, table=True):
    __tablename__ = "templates"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        description="UUID for the template (matches presentation_id)",
    )
    name: str = Field(description="Human friendly template name")
    description: Optional[str] = Field(
        default=None, description="Optional template description"
    )
    category: Optional[str] = Field(
        default="自定义模板",
        sa_column=Column(String, nullable=True, default="自定义模板"),
        description="Template category used for template library filtering",
    )
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), nullable=False, default=get_current_utc_datetime
        ),
    )
