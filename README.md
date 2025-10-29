# Permit Readiness

A web-based pre-submission validation tool for construction permit applications. This application helps architects, developers, and contractors ensure their permit documentation is complete before official submission, reducing delays and rejection rates.

## Demo

Watch a quick demo of the application in action:

[![Permit Readiness Demo](https://github.com/user-attachments/assets/9c8853ab-f5da-47eb-972d-98869f28eb6c)](https://github.com/user-attachments/assets/9c8853ab-f5da-47eb-972d-98869f28eb6c)


## Features

### Core Functionality
- **Multi-Jurisdiction Support** - Pre-configured checklists for NYC, LA, SF, Boston, and DC
- **Document Management** - Upload, validate, and track permit documents
- **PDF Validation** - Automated validation of uploaded PDF documents
- **Progress Tracking** - Real-time completion percentage for required documents
- **Custom Documents** - Add jurisdiction-specific or project-specific documents
- **Readiness Reports** - Generate comprehensive PDF reports for submission
- **User Authentication** - Secure login and registration system
- **Project Management** - Create and manage multiple permit projects

### User Experience
- Modern, responsive UI with Tailwind CSS
- Mobile-friendly interface
- Visual status indicators (uploaded, missing, optional)
- Real-time progress bars
- Organized document checklist by category

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Database (production)
- **SQLite** - Database (development)
- **PyPDF2** - PDF processing and validation
- **JWT** - Authentication tokens

## Project Structure

```
permit-readiness/
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── public/
│   │   └── data/
│   │       └── jurisdictions/   # Jurisdiction requirement files
│   │           ├── new-york-city.json
│   │           ├── los-angeles.json
│   │           ├── san-francisco.json
│   │           ├── boston.json
│   │           └── washington-dc.json
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── main.py                  # FastAPI application
│   ├── models.py                # Database models
│   ├── auth.py                  # Authentication logic
│   ├── database.py              # Database configuration
│   ├── requirements.txt         # Python dependencies
│   └── uploads/                 # Document storage (local)
│
└── README.md
```

## Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.9 or higher)
- **pip** (Python package manager)
- **PostgreSQL** (optional, for production)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend URL
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=sqlite:///./permit_readiness.db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF

# Run database migrations (if applicable)
# python migrate.py

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

## Usage

### 1. Create an Account
- Navigate to the application
- Click "Create one" on the login page
- Fill in username, email, and password
- You'll be automatically logged in

### 2. Start a New Project
- Click "Start New Project" from the home screen
- Enter a project name (e.g., "Downtown Mixed-Use Development")
- Select your jurisdiction from the dropdown
- Click "Create Project"

### 3. Upload Documents
- Review the document checklist
- Click "Upload File" for each required document
- Supported formats: PDF, DWG, DXF, DOCX, XML, ZIP, JPG, PNG
- PDF documents will be automatically validated

### 4. Add Custom Documents
- Click "Add Custom Document" if you need additional items
- Enter document name, description, and notes
- Mark as required/optional
- Select a category

### 5. Generate Report
- Once all required documents are uploaded
- Click "Generate Readiness Report"
- Review the comprehensive checklist
- Download PDF report for submission

### 6. Manage Projects
- View all projects from "View Existing Projects"
- Click on any project to continue working
- Delete projects you no longer need

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication
```
POST   /api/auth/register       - Create new account
POST   /api/auth/login          - Login and get token
GET    /api/auth/me             - Get current user info
```

#### Projects
```
GET    /api/projects/           - List all projects
POST   /api/projects/           - Create new project
GET    /api/projects/{id}       - Get project details
DELETE /api/projects/{id}       - Delete project
POST   /api/projects/{id}/custom-items        - Add custom document
DELETE /api/projects/{id}/custom-items/{item_id} - Remove custom document
GET    /api/projects/{id}/report - Generate PDF report
```

#### Documents
```
POST   /api/documents/          - Upload document
GET    /api/documents/{id}      - Get document details
DELETE /api/documents/{id}      - Delete document
GET    /api/documents/{id}/validation - Get validation results
```

## Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

#### Backend (.env)
```env
DATABASE_URL=sqlite:///./permit_readiness.db
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Jurisdiction Files

Jurisdiction requirements are stored in JSON format in `frontend/public/data/jurisdictions/`

Example structure:
```json
{
  "jurisdiction": {
    "name": "New York City, NY",
    "department": "Department of Buildings"
  },
  "version": "2024.1",
  "lastUpdated": "2024-01-15",
  "processingTimeline": {
    "averageReviewDays": 45
  },
  "checklist": [
    {
      "id": "nyc-app-form",
      "name": "Building Permit Application Form",
      "description": "Complete DOB NOW application",
      "required": true,
      "category": "administrative",
      "acceptedFormats": ["PDF"],
      "maxFileSize": 10,
      "notes": "Use DOB NOW online system",
      "emptyPdfUrl": "/forms/nyc-application.pdf"
    }
  ]
}
```

## Development

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
pytest
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build
# Output will be in frontend/dist/

# Backend is ready as-is, just ensure:
# - Environment variables are set
# - Database is configured
# - Use production ASGI server
```

## Deployment

**Quick Overview:**
1. **Frontend**: Deploy to Vercel or Netlify
2. **Backend**: Deploy to Railway, Render, or DigitalOcean
3. **Database**: Use Railway PostgreSQL or Supabase
4. **File Storage**: Use AWS S3 or Cloudinary for document storage

## Security Considerations

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- SQL injection prevention via ORM
- File type validation
- File size limits
- **TODO**: Rate limiting on API endpoints
- **TODO**: File scanning for malware
- **TODO**: Input sanitization for custom documents

## Roadmap

### Planned Features
- [ ] Email notifications for project status
- [ ] Document version history
- [ ] Project collaboration and sharing
- [ ] Advanced PDF analysis with AI
- [ ] Mobile app (React Native)
- [ ] Integration with jurisdiction APIs
- [ ] Automated deadline tracking
- [ ] Analytics dashboard
- [ ] Export to Excel/CSV
- [ ] Document templates library

### Known Issues
- File uploads limited to 100MB (configurable)
- No real-time collaboration yet
- Limited to 5 pre-configured jurisdictions
- PDF validation is basic (no OCR)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Write clear commit messages
- Add tests for new features
- Update documentation
- Follow existing code style
- Keep PRs focused on single features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



---

**Made with care for the architecture and construction community**
