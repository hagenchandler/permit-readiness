import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, FileText, Download, Plus, ChevronRight } from 'lucide-react';

const PermitReadinessApp = () => {
  const [activeProject, setActiveProject] = useState(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [showReport, setShowReport] = useState(false);

  const jurisdictions = [
    'New York City, NY',
    'Los Angeles, CA',
    'San Francisco, CA',
    'Boston, MA',
    'Washington, D.C.'
  ];

  const checklists = {
    'New York City, NY': [
      { id: 1, name: 'Applicant Statement (PW1)', required: true, fileTypes: 'PDF, DOCX' },
      { id: 2, name: 'Site Plan with Zoning Analysis', required: true, fileTypes: 'PDF, DWG' },
      { id: 3, name: 'Architectural Plans (Floor Plans, Elevations)', required: true, fileTypes: 'PDF, DWG' },
      { id: 4, name: 'Structural Drawings and Calculations', required: true, fileTypes: 'PDF, DWG' },
      { id: 5, name: 'Plumbing Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 6, name: 'Mechanical/HVAC Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 7, name: 'Electrical Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 8, name: 'Fire Alarm and Sprinkler Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 9, name: 'Energy Code Compliance (ECC1)', required: true, fileTypes: 'PDF' },
      { id: 10, name: 'Environmental Assessment', required: true, fileTypes: 'PDF' },
      { id: 11, name: 'Landmarks Preservation Commission Approval', required: false, fileTypes: 'PDF' },
      { id: 12, name: 'Sidewalk Shed Plans', required: false, fileTypes: 'PDF, DWG' }
    ],
    'Los Angeles, CA': [
      { id: 1, name: 'Plot Plan/Site Plan', required: true, fileTypes: 'PDF, DWG' },
      { id: 2, name: 'Architectural Plans (Floor, Roof, Elevations)', required: true, fileTypes: 'PDF, DWG' },
      { id: 3, name: 'Foundation and Structural Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 4, name: 'Soils/Geotechnical Report', required: true, fileTypes: 'PDF' },
      { id: 5, name: 'Title 24 Energy Calculations', required: true, fileTypes: 'PDF, XML' },
      { id: 6, name: 'CalGreen Checklist', required: true, fileTypes: 'PDF' },
      { id: 7, name: 'Electrical Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 8, name: 'Plumbing Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 9, name: 'Mechanical Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 10, name: 'Grading and Drainage Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 11, name: 'CEQA Documentation', required: false, fileTypes: 'PDF' },
      { id: 12, name: 'Historic Resource Assessment', required: false, fileTypes: 'PDF' },
      { id: 13, name: 'Traffic Study', required: false, fileTypes: 'PDF' }
    ],
    'San Francisco, CA': [
      { id: 1, name: 'Site Plan with Building Location', required: true, fileTypes: 'PDF, DWG' },
      { id: 2, name: 'Architectural Drawings', required: true, fileTypes: 'PDF, DWG' },
      { id: 3, name: 'Structural Plans and Calculations', required: true, fileTypes: 'PDF, DWG' },
      { id: 4, name: 'Geotechnical Report', required: true, fileTypes: 'PDF' },
      { id: 5, name: 'Title 24 Energy Compliance', required: true, fileTypes: 'PDF, XML' },
      { id: 6, name: 'Green Building Checklist', required: true, fileTypes: 'PDF' },
      { id: 7, name: 'Fire/Life Safety Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 8, name: 'Accessibility Compliance (CASp)', required: true, fileTypes: 'PDF' },
      { id: 9, name: 'Stormwater Management Plan', required: true, fileTypes: 'PDF' },
      { id: 10, name: 'Transit Impact Analysis', required: false, fileTypes: 'PDF' },
      { id: 11, name: 'Historic Preservation Review', required: false, fileTypes: 'PDF' },
      { id: 12, name: 'Shadow Analysis', required: false, fileTypes: 'PDF' }
    ],
    'Boston, MA': [
      { id: 1, name: 'Site Plan with Setbacks', required: true, fileTypes: 'PDF, DWG' },
      { id: 2, name: 'Architectural Drawings (Plans, Elevations, Sections)', required: true, fileTypes: 'PDF, DWG' },
      { id: 3, name: 'Structural Plans and Calculations', required: true, fileTypes: 'PDF, DWG, DOCX' },
      { id: 4, name: 'Zoning Analysis and Compliance Statement', required: true, fileTypes: 'PDF, DOCX' },
      { id: 5, name: 'Building Energy Code Compliance Form', required: true, fileTypes: 'PDF' },
      { id: 6, name: 'Mechanical/HVAC Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 7, name: 'Plumbing Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 8, name: 'Electrical Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 9, name: 'Fire Protection Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 10, name: 'Stormwater Management Plan', required: true, fileTypes: 'PDF' },
      { id: 11, name: 'Traffic Impact Study', required: false, fileTypes: 'PDF' },
      { id: 12, name: 'Environmental Notification Form', required: false, fileTypes: 'PDF' },
      { id: 13, name: 'Historic Commission Approval', required: false, fileTypes: 'PDF' }
    ],
    'Washington, D.C.': [
      { id: 1, name: 'Plot Plan/Survey', required: true, fileTypes: 'PDF, DWG' },
      { id: 2, name: 'Architectural Plans (Floor Plans, Elevations)', required: true, fileTypes: 'PDF, DWG' },
      { id: 3, name: 'Structural Drawings', required: true, fileTypes: 'PDF, DWG' },
      { id: 4, name: 'Zoning Compliance Statement', required: true, fileTypes: 'PDF, DOCX' },
      { id: 5, name: 'Green Building Checklist', required: true, fileTypes: 'PDF' },
      { id: 6, name: 'Energy Code Compliance (REScheck/COMcheck)', required: true, fileTypes: 'PDF, XML' },
      { id: 7, name: 'Electrical Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 8, name: 'Plumbing Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 9, name: 'Mechanical Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 10, name: 'Fire Alarm and Suppression Plans', required: true, fileTypes: 'PDF, DWG' },
      { id: 11, name: 'Stormwater Management Plan', required: true, fileTypes: 'PDF' },
      { id: 12, name: 'Traffic Impact Study', required: false, fileTypes: 'PDF' },
      { id: 13, name: 'Historic Preservation Review (HPRB)', required: false, fileTypes: 'PDF' },
      { id: 14, name: 'Public Space Application', required: false, fileTypes: 'PDF' }
    ]
  };

  const handleStartProject = () => {
    if (selectedJurisdiction) {
      setActiveProject({
        name: 'New Construction Project',
        jurisdiction: selectedJurisdiction,
        created: new Date().toLocaleDateString()
      });
      setUploadedFiles({});
      setShowReport(false);
    }
  };

  const handleFileUpload = (itemId) => {
    setUploadedFiles(prev => ({
      ...prev,
      [itemId]: {
        name: `document_${itemId}.pdf`,
        size: '2.4 MB',
        uploaded: new Date().toLocaleTimeString()
      }
    }));
  };

  const calculateProgress = () => {
    if (!activeProject) return 0;
    const checklist = checklists[activeProject.jurisdiction] || [];
    const requiredItems = checklist.filter(item => item.required);
    const uploadedRequired = requiredItems.filter(item => uploadedFiles[item.id]);
    return Math.round((uploadedRequired.length / requiredItems.length) * 100);
  };

  const getStatus = (item) => {
    if (uploadedFiles[item.id]) return 'pass';
    if (item.required) return 'missing';
    return 'optional';
  };

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Permit Readiness</h1>
              <p className="text-lg text-gray-600">Pre-Submission Validation Tool</p>
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

            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700 font-medium">Select Jurisdiction</span>
                <select
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a city or county...</option>
                  {jurisdictions.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </label>

              <button
                onClick={handleStartProject}
                disabled={!selectedJurisdiction}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Start New Project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const checklist = checklists[activeProject.jurisdiction] || [];
  const progress = calculateProgress();
  const requiredCount = checklist.filter(i => i.required).length;
  const uploadedRequiredCount = checklist.filter(i => i.required && uploadedFiles[i.id]).length;

  if (showReport) {
    const passedItems = checklist.filter(i => uploadedFiles[i.id]);
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
                  <span className="ml-2 font-medium">{activeProject.created}</span>
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
              <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download PDF Report
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
              onClick={() => setActiveProject(null)}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Document Checklist</h2>
            <div className="space-y-3">
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
                        </div>
                        <p className="text-sm text-gray-600">Accepted: {item.fileTypes}</p>
                      </div>
                      {status === 'pass' ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : status === 'missing' ? (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                    </div>

                    {uploadedFiles[item.id] ? (
                      <div className="bg-white rounded p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{uploadedFiles[item.id].name}</p>
                            <p className="text-xs text-gray-500">{uploadedFiles[item.id].size} • {uploadedFiles[item.id].uploaded}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newFiles = { ...uploadedFiles };
                            delete newFiles[item.id];
                            setUploadedFiles(newFiles);
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleFileUpload(item.id)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        Upload File
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