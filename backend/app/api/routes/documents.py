from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import os
from app.core.database import get_db
from app.schemas.project import Document, DocumentCreate
from app.models.project import Document as DocumentModel, Project as ProjectModel, ValidationResult
from app.services.pdf_parser import PDFParser

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/", response_model=Document)
async def upload_document(
    project_id: int = Form(...),
    checklist_item_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Get project to access validation rules
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create project-specific directory
    project_dir = UPLOAD_DIR / str(project_id)
    project_dir.mkdir(exist_ok=True)
    
    # Save file
    file_path = project_dir / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create database record
    db_document = DocumentModel(
        project_id=project_id,
        checklist_item_id=checklist_item_id,
        filename=file.filename,
        file_path=str(file_path),
        file_size=file_path.stat().st_size,
        file_type=file.content_type
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Parse PDF if it's a PDF file
    if file.filename.lower().endswith('.pdf'):
        try:
            # Find the checklist item to get validation rules
            checklist = project.jurisdiction_data.get('checklist', [])
            checklist_item = next((item for item in checklist if item['id'] == checklist_item_id), None)
            
            if checklist_item and 'validationRules' in checklist_item:
                validation_rules = checklist_item['validationRules']
                
                # Validate the PDF
                validation_result = PDFParser.validate_document(str(file_path), validation_rules)
                
                # Store validation result
                status = 'pass' if validation_result['valid'] else 'warning'
                notes = []
                
                if validation_result['errors']:
                    notes.extend(validation_result['errors'])
                if validation_result['warnings']:
                    notes.extend(validation_result['warnings'])
                
                db_validation = ValidationResult(
                    project_id=project_id,
                    checklist_item_id=checklist_item_id,
                    status=status,
                    notes='\n'.join(notes) if notes else 'Document validated successfully'
                )
                
                db.add(db_validation)
                db.commit()
            else:
                # No validation rules, just mark as pass
                db_validation = ValidationResult(
                    project_id=project_id,
                    checklist_item_id=checklist_item_id,
                    status='pass',
                    notes='Document uploaded successfully (no validation rules defined)'
                )
                db.add(db_validation)
                db.commit()
                
        except Exception as e:
            print(f"Error validating PDF: {e}")
            # Store error in validation result
            db_validation = ValidationResult(
                project_id=project_id,
                checklist_item_id=checklist_item_id,
                status='warning',
                notes=f'Could not validate PDF: {str(e)}'
            )
            db.add(db_validation)
            db.commit()
    
    return db_document

@router.get("/{document_id}/summary")
def get_document_summary(document_id: int, db: Session = Depends(get_db)):
    """Get a summary of document contents (for PDFs)"""
    document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not document.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files can be summarized")
    
    try:
        summary = PDFParser.get_document_summary(document.file_path)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing PDF: {str(e)}")

@router.get("/{document_id}/validation")
def get_document_validation(document_id: int, db: Session = Depends(get_db)):
    """Get validation results for a document"""
    document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    validation = db.query(ValidationResult).filter(
        ValidationResult.project_id == document.project_id,
        ValidationResult.checklist_item_id == document.checklist_item_id
    ).order_by(ValidationResult.validated_at.desc()).first()
    
    if not validation:
        return {"status": "no_validation", "notes": "No validation performed"}
    
    return {
        "status": validation.status,
        "notes": validation.notes,
        "validated_at": validation.validated_at
    }

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file from filesystem
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # Delete validation results
    db.query(ValidationResult).filter(
        ValidationResult.project_id == document.project_id,
        ValidationResult.checklist_item_id == document.checklist_item_id
    ).delete()
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}
