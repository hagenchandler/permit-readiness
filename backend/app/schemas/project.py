from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class DocumentBase(BaseModel):
    checklist_item_id: str
    filename: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int
    project_id: int
    file_path: str
    file_size: Optional[int]
    file_type: Optional[str]
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    name: str
    jurisdiction: str

class ProjectCreate(ProjectBase):
    jurisdiction_data: Optional[Dict[str, Any]] = None

class Project(ProjectBase):
    id: int
    jurisdiction_data: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]
    documents: List[Document] = []

    class Config:
        from_attributes = True


class ProjectSummary(BaseModel):
    id: int
    name: str
    jurisdiction: str
    created_at: datetime
    document_count: int
    completion_percentage: int

    class Config:
        from_attributes = True
