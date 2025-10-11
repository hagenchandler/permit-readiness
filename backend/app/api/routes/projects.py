from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.schemas.project import Project, ProjectCreate, ProjectSummary
from app.models.project import Project as ProjectModel
from app.models.user import User
from fastapi.responses import StreamingResponse
from app.services.report_generator import generate_readiness_report

router = APIRouter()

@router.post("/", response_model=Project)
def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_project = ProjectModel(**project.dict(), user_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/", response_model=List[ProjectSummary])
def list_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    projects = db.query(ProjectModel).filter(
        ProjectModel.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    summaries = []
    for project in projects:
        doc_count = len(project.documents)
        completion = 0
        if project.jurisdiction_data and 'checklist' in project.jurisdiction_data:
            required_items = [item for item in project.jurisdiction_data['checklist'] if item.get('required')]
            if required_items:
                completion = int((doc_count / len(required_items)) * 100)
        
        summaries.append(ProjectSummary(
            id=project.id,
            name=project.name,
            jurisdiction=project.jurisdiction,
            created_at=project.created_at,
            document_count=doc_count,
            completion_percentage=min(completion, 100)
        ))
    
    return summaries

@router.get("/{project_id}", response_model=Project)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@router.get("/{project_id}/report")
def download_report(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    pdf_buffer = generate_readiness_report(project, project.documents)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=permit_readiness_report_{project_id}.pdf"
        }
    )

@router.post("/{project_id}/custom-items")
def add_custom_item(
    project_id: int,
    item: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.jurisdiction_data:
        project.jurisdiction_data = {"checklist": []}
    
    if "checklist" not in project.jurisdiction_data:
        project.jurisdiction_data["checklist"] = []
    
    item["custom"] = True
    project.jurisdiction_data["checklist"].append(item)
    
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(project, "jurisdiction_data")
    
    db.commit()
    db.refresh(project)
    
    return {"message": "Custom item added", "item": item}

@router.delete("/{project_id}/custom-items/{item_id}")
def remove_custom_item(
    project_id: int,
    item_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.jurisdiction_data or "checklist" not in project.jurisdiction_data:
        raise HTTPException(status_code=404, detail="No checklist found")
    
    original_length = len(project.jurisdiction_data["checklist"])
    project.jurisdiction_data["checklist"] = [
        item for item in project.jurisdiction_data["checklist"]
        if not (item.get("id") == item_id and item.get("custom"))
    ]
    
    if len(project.jurisdiction_data["checklist"]) == original_length:
        raise HTTPException(status_code=404, detail="Custom item not found")
    
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(project, "jurisdiction_data")
    
    db.commit()
    
    return {"message": "Custom item removed"}
