import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, FileText, Download, Plus, ChevronRight, Loader, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

const jurisdictionFiles = {
  'New York City, NY': '/data/jurisdictions/new-york-city.json',
  'Los Angeles, CA': '/data/jurisdictions/los-angeles.json',
  'San Francisco, CA': '/data/jurisdictions/san-francisco.json',
  'Boston, MA': '/data/jurisdictions/boston.json',
  'Washington, D.C.': '/data/jurisdictions/washington-dc.json'
};

const PermitReadinessApp = () => {
  const [view, setView] = useState('login');
  const [activeProject, setActiveProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [projectName, setProjectName] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [validationResults, setValidationResults] = useState({});
  const [showReport, setShowReport] = useState(false);
  const [jurisdictionData, setJurisdictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddCustomItem, setShowAddCustomItem] = useState(false);
  const [customItemForm, setCustomItemForm] = useState({
    name: '',
    description: '',
    required: false,
    category: 'other',
    acceptedFormats: ['PDF'],
    notes: ''
  });
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });

  const jurisdictions = Object.keys(jurisdictionFiles);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedJurisdiction && !activeProject) {
      loadJurisdictionData(selectedJurisdiction);
    }
  }, [selectedJurisdiction, activeProject]);

  const fetchCurrentUser = async (authToken = null) => {
    const tokenToUse = authToken || token;
    
    if (!tokenToUse) {
      setView('login');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setView('home');
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setView('login');
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
      setToken(null);
      setView('login');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        await fetchCurrentUser(data.access_token);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: registerForm.username,
            password: registerForm.password
          })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
          localStorage.setItem('token', loginData.access_token);
          setToken(loginData.access_token);
          await fetchCurrentUser(loginData.access_token);
        } else {
          setView('login');
          setError('Account created! Please log in manually.');
        }
      } else {
        setError(data.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setActiveProject(null);
    setProjects([]);
    setView('login');
  };

  const loadProjects = async () => {
    const authToken = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const createProject = async (projectData) => {
    const authToken = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        const project = await response.json();
        return project;
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  };

  const loadProject = async (projectId) => {
    const authToken = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const project = await response.json();
        return project;
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const deleteProject = async (projectId) => {
    const authToken = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        loadProjects();
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const uploadDocument = async (projectId, checklistItemId, file) => {
    const authToken = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      formData.append('checklist_item_id', checklistItemId);
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      if (response.ok) {
        const document = await response.json();
        return document;
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
      throw err;
    }
  };

  const deleteDocument = async (documentId) => {
    const authToken = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      return response.ok;
    } catch (err) {
      console.error('Failed to delete document:', err);
      return false;
    }
  };

  const loadJurisdictionData = async (jurisdiction) => {
    setLoading(true);
    setError(null);
    
    try {
      const filePath = jurisdictionFiles[jurisdiction];
      const response = await fetch(filePath);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setJurisdictionData(data);
    } catch (err) {
      setError(`Failed to load requirements for ${jurisdiction}: ${err.message}`);
      console.error('Error loading jurisdiction data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProject = async () => {
    if (selectedJurisdiction && jurisdictionData && projectName.trim()) {
      setLoading(true);
      try {
        const project = await createProject({
          name: projectName.trim(),
          jurisdiction: selectedJurisdiction,
          jurisdiction_data: jurisdictionData
        });

        if (!project) {
          throw new Error('No project returned from API');
        }

        setActiveProject(project);
        setUploadedFiles({});
        setValidationResults({});
        setShowReport(false);
        setView('dashboard');
      } catch (err) {
        console.error('Error in handleStartProject:', err);
        setError('Failed to create project: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleOpenProject = async (projectId) => {
    const authToken = localStorage.getItem('token');
    setLoading(true);
    try {
      const project = await loadProject(projectId);
      if (project) {
        setActiveProject(project);
        
        const files = {};
        const validations = {};
        
        for (const doc of project.documents) {
          files[doc.checklist_item_id] = {
            id: doc.id,
            name: doc.filename,
            size: (doc.file_size / (1024 * 1024)).toFixed(2) + ' MB',
            uploaded: new Date(doc.uploaded_at).toLocaleTimeString(),
            type: doc.file_type
          };
          
          try {
            const validationResponse = await fetch(`${API_BASE_URL}/documents/${doc.id}/validation`, {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });
            if (validationResponse.ok) {
              const validationData = await validationResponse.json();
              validations[doc.checklist_item_id] = validationData;
            }
          } catch (err) {
            console.error('Failed to load validation:', err);
          }
        }
        
        setUploadedFiles(files);
        setValidationResults(validations);
        setView('dashboard');
      }
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (itemId) => {
    if (!activeProject) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.dwg,.dxf,.docx,.xml,.zip,.jpg,.png';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const checklist = activeProject.jurisdiction_data.checklist;
      const item = checklist.find(i => i.id === itemId);
      const acceptedFormats = item?.acceptedFormats || [];
      
      const fileExtension = file.name.split('.').pop().toUpperCase();
      if (acceptedFormats.length > 0 && !acceptedFormats.includes(fileExtension)) {
        alert(`Invalid file type. Please upload one of: ${acceptedFormats.join(', ')}`);
        return;
      }

      const maxSize = (item?.maxFileSize || 100) * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File too large. Maximum size: ${item?.maxFileSize || 100} MB`);
        return;
      }

      setLoading(true);
      const authToken = localStorage.getItem('token');
      try {
        const document = await uploadDocument(activeProject.id, itemId, file);
        
        setUploadedFiles(prev => ({
          ...prev,
          [itemId]: {
            id: document.id,
            name: document.filename,
            size: (document.file_size / (1024 * 1024)).toFixed(2) + ' MB',
            uploaded: new Date(document.uploaded_at).toLocaleTimeString(),
            type: document.file_type
          }
        }));
        
        if (file.name.toLowerCase().endsWith('.pdf')) {
          try {
            const validationResponse = await fetch(`${API_BASE_URL}/documents/${document.id}/validation`, {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });
            if (validationResponse.ok) {
              const validationData = await validationResponse.json();
              setValidationResults(prev => ({
                ...prev,
                [itemId]: validationData
              }));
            }
          } catch (err) {
            console.error('Failed to load validation:', err);
          }
        }
      } catch (err) {
        alert('Failed to upload file');
      } finally {
        setLoading(false);
      }
    };

    input.click();
  };

  const handleRemoveFile = async (itemId) => {
    const fileData = uploadedFiles[itemId];
    if (!fileData || !fileData.id) return;

    setLoading(true);
    try {
      const success = await deleteDocument(fileData.id);
      if (success) {
        const newFiles = { ...uploadedFiles };
        delete newFiles[itemId];
        setUploadedFiles(newFiles);
        
        const newValidations = { ...validationResults };
        delete newValidations[itemId];
        setValidationResults(newValidations);
      }
    } catch (err) {
      alert('Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!activeProject) return;
    
    const authToken = localStorage.getItem('token');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${activeProject.id}/report`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `permit_readiness_report_${activeProject.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate report');
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomItem = async () => {
    if (!activeProject || !customItemForm.name.trim()) {
      alert('Please enter a document name');
      return;
    }

    const authToken = localStorage.getItem('token');
    setLoading(true);
    try {
      const customItem = {
        id: `custom-${Date.now()}`,
        name: customItemForm.name.trim(),
        description: customItemForm.description.trim(),
        required: customItemForm.required,
        category: customItemForm.category,
        acceptedFormats: customItemForm.acceptedFormats,
        notes: customItemForm.notes.trim(),
        custom: true
      };

      const response = await fetch(`${API_BASE_URL}/projects/${activeProject.id}/custom-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(customItem)
      });

      if (response.ok) {
        const updatedProject = await loadProject(activeProject.id);
        setActiveProject(updatedProject);
        
        setCustomItemForm({
          name: '',
          description: '',
          required: false,
          category: 'other',
          acceptedFormats: ['PDF'],
          notes: ''
        });
        setShowAddCustomItem(false);
      } else {
        alert('Failed to add custom item');
      }
    } catch (err) {
      console.error('Error adding custom item:', err);
      alert('Failed to add custom item');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCustomItem = async (itemId) => {
    if (!activeProject) return;

    if (!confirm('Are you sure you want to remove this custom document?')) {
      return;
    }

    const authToken = localStorage.getItem('token');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${activeProject.id}/custom-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const updatedProject = await loadProject(activeProject.id);
        setActiveProject(updatedProject);
        
        const newFiles = { ...uploadedFiles };
        delete newFiles[itemId];
        setUploadedFiles(newFiles);
      } else {
        alert('Failed to remove custom item');
      }
    } catch (err) {
      console.error('Error removing custom item:', err);
      alert('Failed to remove custom item');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!activeProject) return 0;
    const checklist = activeProject.jurisdiction_data.checklist;
    const requiredItems = checklist.filter(item => item.required);
    const uploadedRequired = requiredItems.filter(item => uploadedFiles[item.id]);
    return Math.round((uploadedRequired.length / requiredItems.length) * 100);
  };

  const getStatus = (item) => {
    if (uploadedFiles[item.id]) return 'pass';
    if (item.required) return 'missing';
    return 'optional';
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Permit Readiness</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setView('register');
                  setError(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join Permit Readiness</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (Optional)</label>
              <input
                type="text"
                value={registerForm.full_name}
                onChange={(e) => setRegisterForm({...registerForm, full_name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setView('login');
                  setError(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="text-center flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Permit Readiness</h1>
                <p className="text-lg text-gray-600">Pre-Submission Validation Tool</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Signed in as</p>
                  <p className="font-medium text-gray-900">{user?.username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How it works</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 mr-2 mt-0.5 text-blue-500" />
                  <span>Select your jurisdiction to load specific requirements</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 mr-2 mt-0.5 text-blue-500" />
                  <span>Upload all required documents for validation</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 mr-2 mt-0.5 text-blue-500" />
                  <span>Get instant feedback and generate a readiness report</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setView('new-project')}
                className="bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-6 h-6" />
                Start New Project
              </button>
              <button
                onClick={() => {
                  loadProjects();
                  setView('projects');
                }}
                className="bg-gray-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-6 h-6" />
                View Existing Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'new-project') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
              <button
                onClick={() => setView('home')}
                className="text-gray-600 hover:text-gray-800"
              >
                Back to Home
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700 font-medium">Project Name</span>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Downtown Mixed-Use Development"
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </label>

              <label className="block">
                <span className="text-gray-700 font-medium">Select Jurisdiction</span>
                <select
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Choose a city...</option>
                  {jurisdictions.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </label>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Loading requirements...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              {jurisdictionData && !loading && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✓ Loaded {jurisdictionData.checklist.length} requirements for {jurisdictionData.jurisdiction.name}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Version {jurisdictionData.version} • Average review time: {jurisdictionData.processingTimeline.averageReviewDays} days
                  </p>
                </div>
              )}

              <button
                onClick={handleStartProject}
                disabled={!selectedJurisdiction || !jurisdictionData || !projectName.trim() || loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'projects') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setView('new-project')}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Project
                </button>
                <button
                  onClick={() => setView('home')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Back to Home
                </button>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">No projects yet</p>
                <button
                  onClick={() => setView('new-project')}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOpenProject(project.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.jurisdiction}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this project?')) {
                            deleteProject(project.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.completion_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.completion_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{project.document_count} documents</span>
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const checklist = activeProject?.jurisdiction_data?.checklist || [];
  const progress = calculateProgress();
  const requiredCount = checklist.filter(i => i.required).length;
  const uploadedRequiredCount = checklist.filter(i => i.required && uploadedFiles[i.id]).length;

  if (showReport) {
    const missingRequired = checklist.filter(i => i.required && !uploadedFiles[i.id]);

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Readiness Report</h1>
              <button
                onClick={() => setShowReport(false)}
                className="text-blue-600 hover:text-blue-700"
              >
                Back to Dashboard
              </button>
            </div>

            <div className="border-b pb-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">Project Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Project:</span>
                  <span className="ml-2 font-medium">{activeProject.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Jurisdiction:</span>
                  <span className="ml-2 font-medium">{activeProject.jurisdiction}</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">{new Date(activeProject.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-medium ${missingRequired.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {missingRequired.length === 0 ? 'Ready for Submission' : 'Incomplete'}
                  </span>
                </div>
              </div>
            </div>

            {missingRequired.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-900">All Requirements Met!</h3>
                </div>
                <p className="text-green-800">
                  Your submission package is complete and ready for official filing with {activeProject.jurisdiction}.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <h3 className="text-xl font-semibold text-red-900">Missing Required Documents</h3>
                </div>
                <p className="text-red-800 mb-3">
                  The following required documents must be uploaded before submission:
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  {missingRequired.map(item => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Document Checklist</h3>
              <div className="space-y-2">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      uploadedFiles[item.id]
                        ? 'bg-green-50 border border-green-200'
                        : item.required
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {uploadedFiles[item.id] ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : item.required ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-medium">{item.name}</span>
                      {!item.required && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Optional</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {uploadedFiles[item.id] ? 'Uploaded' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleDownloadReport}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {loading ? 'Generating...' : 'Download PDF Report'}
              </button>
              {missingRequired.length === 0 && (
                <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700">
                  Proceed to Submission
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{activeProject.name}</h1>
              <p className="text-gray-600">{activeProject.jurisdiction}</p>
            </div>
            <button
              onClick={() => {
                setActiveProject(null);
                setView('projects');
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Exit Project
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completion Progress</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {uploadedRequiredCount} of {requiredCount} required documents uploaded
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Document Checklist</h2>
              <button
                onClick={() => setShowAddCustomItem(!showAddCustomItem)}
                className="text-sm bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Custom Document
              </button>
            </div>

            {showAddCustomItem && (
              <div className="mb-4 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                <h3 className="font-semibold text-gray-900 mb-3">Add Custom Document</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Document Name (e.g., Special Use Permit)"
                    value={customItemForm.name}
                    onChange={(e) => setCustomItemForm({...customItemForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={customItemForm.description}
                    onChange={(e) => setCustomItemForm({...customItemForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    rows="2"
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={customItemForm.notes}
                    onChange={(e) => setCustomItemForm({...customItemForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={customItemForm.required}
                        onChange={(e) => setCustomItemForm({...customItemForm, required: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Required</span>
                    </label>
                    <select
                      value={customItemForm.category}
                      onChange={(e) => setCustomItemForm({...customItemForm, category: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="other">Other</option>
                      <option value="administrative">Administrative</option>
                      <option value="site-plan">Site Plan</option>
                      <option value="environmental">Environmental</option>
                      <option value="zoning">Zoning</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCustomItem}
                      disabled={loading || !customItemForm.name.trim()}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-300"
                    >
                      Add Document
                    </button>
                    <button
                      onClick={() => setShowAddCustomItem(false)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {checklist.map(item => {
                const status = getStatus(item);
                
                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 ${
                      status === 'pass'
                        ? 'border-green-300 bg-green-50'
                        : status === 'missing'
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          {item.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                          )}
                          {item.custom && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Custom</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Accepted: {item.acceptedFormats?.join(', ') || 'PDF, DWG'}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                        )}
                        {item.emptyPdfUrl && (
                          <div className="mt-2">
                            <a
                              href={item.emptyPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="font-medium">Download Empty PDF</span>
                            </a>
                          </div>
                        )}
                        {item.exampleUrl && !item.emptyPdfUrl && (
                          <div className="mt-2">
                            <a
                              href={item.exampleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="font-medium">View Instructions</span>
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {status === 'pass' ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        ) : status === 'missing' ? (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                        )}
                        {item.custom && (
                          <button
                            onClick={() => handleRemoveCustomItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Remove custom document"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {uploadedFiles[item.id] ? (
                      <div className="bg-white rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{uploadedFiles[item.id].name}</p>
                              <p className="text-xs text-gray-500">{uploadedFiles[item.id].size} • {uploadedFiles[item.id].uploaded}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </div>
                        
                        {validationResults[item.id] && validationResults[item.id].status !== 'no_validation' && (
                          <div className={`mt-2 p-2 rounded text-xs ${
                            validationResults[item.id].status === 'pass' 
                              ? 'bg-green-50 text-green-800 border border-green-200' 
                              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          }`}>
                            <div className="flex items-start gap-2">
                              {validationResults[item.id].status === 'pass' ? (
                                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold mb-1">
                                  {validationResults[item.id].status === 'pass' ? 'Validation Passed' : 'Validation Warnings'}
                                </p>
                                <p className="whitespace-pre-line">{validationResults[item.id].notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleFileUpload(item.id)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2 text-sm disabled:bg-gray-400"
                        disabled={loading}
                      >
                        <Upload className="w-4 h-4" />
                        {loading ? 'Uploading...' : 'Upload File'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Validation Summary</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Uploaded</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">{Object.keys(uploadedFiles).length}</p>
                <p className="text-sm text-green-600">documents validated</p>
              </div>

              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Missing Required</h3>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {requiredCount - uploadedRequiredCount}
                </p>
                <p className="text-sm text-red-600">documents needed</p>
              </div>

              <div className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Optional</h3>
                </div>
                <p className="text-2xl font-bold text-gray-700">
                  {checklist.filter(i => !i.required).length - checklist.filter(i => !i.required && uploadedFiles[i.id]).length}
                </p>
                <p className="text-sm text-gray-600">documents remaining</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Jurisdiction Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Review Time:</span>
                  <span className="font-medium">{activeProject.jurisdiction_data.processingTimeline.averageReviewDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Checklist Version:</span>
                  <span className="font-medium">{activeProject.jurisdiction_data.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{checklist.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
              {uploadedRequiredCount === requiredCount ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    All required documents uploaded
                  </p>
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Generate Readiness Report
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Upload all required documents to proceed with validation.</p>
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                  >
                    Complete Required Items First
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermitReadinessApp;
