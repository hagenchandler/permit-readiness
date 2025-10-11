from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import io

def generate_readiness_report(project, documents):
    """
    Generate a PDF readiness report for a project
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Title
    story.append(Paragraph("Permit Readiness Report", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Project Information Section
    story.append(Paragraph("Project Information", heading_style))
    
    project_data = [
        ['Project Name:', project.name],
        ['Jurisdiction:', project.jurisdiction],
        ['Created Date:', project.created_at.strftime('%B %d, %Y')],
        ['Report Generated:', datetime.now().strftime('%B %d, %Y at %I:%M %p')],
    ]
    
    project_table = Table(project_data, colWidths=[2*inch, 4*inch])
    project_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    
    story.append(project_table)
    story.append(Spacer(1, 0.4*inch))
    
    # Validation Status Section
    story.append(Paragraph("Validation Status", heading_style))
    
    checklist = project.jurisdiction_data.get('checklist', [])
    required_items = [item for item in checklist if item.get('required')]
    uploaded_ids = [doc.checklist_item_id for doc in documents]
    uploaded_required = [item for item in required_items if item['id'] in uploaded_ids]
    
    completion_percentage = int((len(uploaded_required) / len(required_items)) * 100) if required_items else 0
    
    status_color = colors.HexColor('#10b981') if completion_percentage == 100 else colors.HexColor('#ef4444')
    status_text = "✓ READY FOR SUBMISSION" if completion_percentage == 100 else "✗ INCOMPLETE"
    
    status_data = [
        ['Status:', status_text],
        ['Completion:', f'{completion_percentage}%'],
        ['Required Documents:', f'{len(uploaded_required)} of {len(required_items)} uploaded'],
        ['Optional Documents:', f'{len(documents) - len(uploaded_required)} uploaded'],
    ]
    
    status_table = Table(status_data, colWidths=[2*inch, 4*inch])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#f0fdf4') if completion_percentage == 100 else colors.HexColor('#fef2f2')),
        ('TEXTCOLOR', (1, 0), (1, 0), status_color),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    
    story.append(status_table)
    story.append(Spacer(1, 0.4*inch))
    
    # Document Checklist Section
    story.append(Paragraph("Document Checklist", heading_style))
    
    checklist_data = [['Status', 'Document Name', 'Required', 'Uploaded']]
    
    for item in checklist:
        status_icon = '✓' if item['id'] in uploaded_ids else '✗'
        status_color_cell = colors.HexColor('#10b981') if item['id'] in uploaded_ids else (colors.HexColor('#ef4444') if item.get('required') else colors.grey)
        
        doc_name = item.get('name', 'Unknown Document')
        required_text = 'Yes' if item.get('required') else 'No'
        
        uploaded_doc = next((doc for doc in documents if doc.checklist_item_id == item['id']), None)
        uploaded_text = uploaded_doc.filename if uploaded_doc else 'Not uploaded'
        
        checklist_data.append([
            status_icon,
            doc_name,
            required_text,
            uploaded_text
        ])
    
    checklist_table = Table(checklist_data, colWidths=[0.5*inch, 2.5*inch, 1*inch, 2*inch])
    checklist_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
    ]))
    
    # Apply conditional formatting to status column
    for i, item in enumerate(checklist, start=1):
        if item['id'] in uploaded_ids:
            checklist_table.setStyle(TableStyle([
                ('TEXTCOLOR', (0, i), (0, i), colors.HexColor('#10b981')),
                ('FONTNAME', (0, i), (0, i), 'Helvetica-Bold'),
            ]))
        else:
            color = colors.HexColor('#ef4444') if item.get('required') else colors.grey
            checklist_table.setStyle(TableStyle([
                ('TEXTCOLOR', (0, i), (0, i), color),
                ('FONTNAME', (0, i), (0, i), 'Helvetica-Bold'),
            ]))
    
    story.append(checklist_table)
    story.append(Spacer(1, 0.4*inch))
    
    # Missing Documents Section (if any)
    missing_required = [item for item in required_items if item['id'] not in uploaded_ids]
    
    if missing_required:
        story.append(Paragraph("Missing Required Documents", heading_style))
        
        missing_text = "<br/>".join([f"• {item.get('name')}" for item in missing_required])
        missing_para = Paragraph(missing_text, styles['Normal'])
        story.append(missing_para)
        story.append(Spacer(1, 0.3*inch))
    
    # Next Steps Section
    story.append(Paragraph("Next Steps", heading_style))
    
    if completion_percentage == 100:
        next_steps_text = """
        Your submission package is complete and ready for official filing. Please ensure:
        <br/><br/>
        • All documents are signed and sealed by licensed professionals where required<br/>
        • All forms are notarized as needed<br/>
        • You have reviewed all documents for accuracy<br/>
        • You have the required filing fees ready<br/>
        <br/>
        You may now proceed with submitting your application to the jurisdiction.
        """
    else:
        next_steps_text = """
        Your submission package is incomplete. Please:
        <br/><br/>
        • Upload all missing required documents listed above<br/>
        • Ensure all documents meet the file format and size requirements<br/>
        • Verify all professional seals and signatures are included<br/>
        • Generate a new report once all documents are uploaded<br/>
        """
    
    next_steps_para = Paragraph(next_steps_text, styles['Normal'])
    story.append(next_steps_para)
    
    # Footer
    story.append(Spacer(1, 0.5*inch))
    footer_text = f"<i>Generated by Permit Readiness Tool on {datetime.now().strftime('%B %d, %Y')}</i>"
    footer_para = Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER))
    story.append(footer_para)
    
    # Build PDF
    doc.build(story)
    
    buffer.seek(0)
    return buffer
