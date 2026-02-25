import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Image, File, X, Camera } from 'lucide-react';
import { loanService } from '../services/loanService';
import { showToast } from '../utils/toast';
import SelfieCapture from '../components/SelfieCapture';

const DocumentUpload = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState({
    identityProof: null,
    addressProof: null,
    incomeProof: null,
    photo: null
  });
  const [previews, setPreviews] = useState({
    identityProof: null,
    addressProof: null,
    incomeProof: null,
    photo: null
  });
  const [error, setError] = useState('');

  const documentTypes = [
    {
      key: 'identityProof',
      title: 'Identity Proof',
      subtitle: 'Aadhaar Card, PAN Card, or Passport',
      icon: FileText,
      accept: '.pdf,.jpg,.jpeg,.png',
      required: true
    },
    {
      key: 'addressProof',
      title: 'Address Proof',
      subtitle: 'Utility Bill, Rent Agreement, or Bank Statement',
      icon: FileText,
      accept: '.pdf,.jpg,.jpeg,.png',
      required: true
    },
    {
      key: 'incomeProof',
      title: 'Income Proof',
      subtitle: 'Salary Slips, ITR, or Bank Statements',
      icon: FileText,
      accept: '.pdf,.jpg,.jpeg,.png',
      required: true
    },
    {
      key: 'photo',
      title: 'Live Selfie',
      subtitle: 'Capture a live selfie using your camera',
      icon: Camera,
      accept: '.jpg,.jpeg,.png',
      required: true,
      isSelfie: true
    }
  ];

  const handleFileSelect = (key, file) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB');
      return;
    }

    setDocuments(prev => ({ ...prev, [key]: file }));
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews(prev => ({ ...prev, [key]: 'pdf' }));
    }
    
    setError('');
  };

  const removeFile = (key) => {
    setDocuments(prev => ({ ...prev, [key]: null }));
    setPreviews(prev => ({ ...prev, [key]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all required documents are uploaded
    const missingDocs = documentTypes
      .filter(doc => doc.required && !documents[doc.key])
      .map(doc => doc.title);

    if (missingDocs.length > 0) {
      setError(`Please upload: ${missingDocs.join(', ')}`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formData.append(key, documents[key]);
        }
      });

      await loanService.uploadDocuments(applicationId, formData);
      
      // Show success message and redirect to dashboard
      showToast.success('Documents uploaded successfully! Your application is now under review.');
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
              <p className="text-sm text-gray-600">Application #{applicationId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full font-semibold">
                <CheckCircle size={20} />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Application</span>
            </div>
            <div className="w-16 h-1 bg-blue-500"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Documents</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-300 text-gray-600 rounded-full font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Review</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Document Upload Cards */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentTypes.map((docType) => {
              const Icon = docType.icon;
              const file = documents[docType.key];
              const preview = previews[docType.key];

              return (
                <div
                  key={docType.key}
                  className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-300 transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Icon className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {docType.title}
                          {docType.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        <p className="text-xs text-gray-500">{docType.subtitle}</p>
                      </div>
                    </div>
                    {file && (
                      <button
                        type="button"
                        onClick={() => removeFile(docType.key)}
                        className="p-1 hover:bg-red-50 rounded-full transition"
                      >
                        <X className="text-red-500" size={20} />
                      </button>
                    )}
                  </div>

                  {!file ? (
                    docType.isSelfie ? (
                      <SelfieCapture
                        onCapture={(capturedFile) => handleFileSelect(docType.key, capturedFile)}
                        preview={preview || null}
                      />
                    ) : (
                      <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Click to upload or drag & drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, JPG, PNG (max 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept={docType.accept}
                          onChange={(e) => handleFileSelect(docType.key, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    )
                  ) : (
                    <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4">
                      {preview && preview !== 'pdf' ? (
                        <img
                          src={preview}
                          alt={docType.title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-white rounded-lg mb-3">
                          <File className="text-gray-400" size={48} />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={20} />
                        <p className="text-sm font-medium text-green-800 truncate flex-1">
                          {file.name}
                        </p>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </span>
              ) : (
                'Submit Documents'
              )}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Secure & Confidential</h4>
              <p className="text-sm text-blue-700">
                All documents are encrypted and stored securely. Your information will only be used for loan processing and verification purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;