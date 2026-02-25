import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, User, DollarSign, FileText, Image, 
  Shield, TrendingUp, Download, Eye, CheckCircle, XCircle, Loader
} from 'lucide-react';
import { loanService } from '../services/loanService';

const AdminReviewDetail = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      const appData = await loanService.getApplicationStatus(applicationId);
      const docsData = await loanService.getApplicationDocuments(applicationId);
      setApplication(appData);
      setDocuments(docsData);
    } catch (err) {
      console.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    if (!window.confirm(`Are you sure you want to ${decision.toLowerCase()} this application?`)) {
      return;
    }

    setProcessing(true);
    try {
      await loanService.reviewApplication(applicationId, decision);
      alert(`Application ${decision.toLowerCase()} successfully!`);
      navigate('/admin/dashboard');
    } catch (err) {
      alert('Failed to update application');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  const approvalProb = application?.approval_probability || 0;
  const fraudScore = application?.fraud_score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
                <p className="text-sm text-gray-600">ID: #{applicationId}</p>
              </div>
            </div>
            {application?.status === 'UNDER_REVIEW' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleDecision('REJECTED')}
                  disabled={processing}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold shadow-lg disabled:opacity-50"
                >
                  <X size={20} />
                  Reject
                </button>
                <button
                  onClick={() => handleDecision('APPROVED')}
                  disabled={processing}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold shadow-lg disabled:opacity-50"
                >
                  <Check size={20} />
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Application Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="text-blue-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Applicant Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{application?.user?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{application?.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Education</p>
                  <p className="text-lg font-semibold text-gray-900">{application?.education}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Employment</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {application?.self_employed ? 'Self Employed' : 'Employed'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dependents</p>
                  <p className="text-lg font-semibold text-gray-900">{application?.no_of_dependents}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Financial Details</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
                  <p className="text-2xl font-bold text-blue-600">₹{application?.loan_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Annual Income</p>
                  <p className="text-2xl font-bold text-green-600">₹{application?.income_annum?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Loan Term</p>
                  <p className="text-2xl font-bold text-purple-600">{application?.loan_term} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">CIBIL Score</p>
                  <p className={`text-2xl font-bold ${
                    application?.cibil_score >= 750 ? 'text-green-600' : 
                    application?.cibil_score >= 650 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {application?.cibil_score}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Residential Assets</p>
                  <p className="text-lg font-semibold text-gray-900">₹{application?.residential_assets_value?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bank Assets</p>
                  <p className="text-lg font-semibold text-gray-900">₹{application?.bank_asset_value?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Uploaded Documents */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="text-purple-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Uploaded Documents</h2>
              </div>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 transition">
                      {doc.type === 'photo' ? (
                        <div 
                          className="cursor-pointer"
                          onClick={() => setSelectedImage(doc.url)}
                        >
                          <img 
                            src={doc.url} 
                            alt={doc.name} 
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{doc.name}</p>
                              <p className="text-xs text-gray-500">Applicant Photo</p>
                            </div>
                            <Eye className="text-blue-600" size={20} />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                            <FileText className="text-gray-400" size={48} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.type}</p>
                            </div>
                            <a 
                              href={doc.url} 
                              download 
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition ml-2"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - AI Analysis */}
          <div className="space-y-6">
            {/* Approval Probability */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={24} />
                <h3 className="text-lg font-bold">AI Approval Score</h3>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{(approvalProb * 100).toFixed(1)}%</div>
                <p className="text-blue-100">Approval Probability</p>
                <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${approvalProb * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Fraud Score */}
            <div className={`rounded-2xl shadow-lg p-6 text-white ${
              fraudScore < 0.3 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
              fraudScore < 0.6 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
              'bg-gradient-to-br from-red-500 to-pink-600'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Shield size={24} />
                <h3 className="text-lg font-bold">Fraud Risk Score</h3>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{(fraudScore * 100).toFixed(1)}%</div>
                <p className="opacity-90">
                  {fraudScore < 0.3 ? 'Low Risk' : fraudScore < 0.6 ? 'Medium Risk' : 'High Risk'}
                </p>
                <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${fraudScore * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">AI Recommendation</h3>
              <div className={`p-4 rounded-xl ${
                application?.final_decision === 'APPROVED' ? 'bg-green-50 border-2 border-green-300' :
                application?.final_decision === 'REJECTED' ? 'bg-red-50 border-2 border-red-300' :
                'bg-yellow-50 border-2 border-yellow-300'
              }`}>
                {application?.final_decision === 'APPROVED' ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={32} />
                    <div>
                      <p className="font-bold text-green-900">Recommend Approval</p>
                      <p className="text-sm text-green-700 mt-1">Strong indicators for approval</p>
                    </div>
                  </div>
                ) : application?.final_decision === 'REJECTED' ? (
                  <div className="flex items-center gap-3">
                    <XCircle className="text-red-600" size={32} />
                    <div>
                      <p className="font-bold text-red-900">Recommend Rejection</p>
                      <p className="text-sm text-red-700 mt-1">Concerns detected in application</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Eye className="text-yellow-600" size={32} />
                    <div>
                      <p className="font-bold text-yellow-900">Manual Review Required</p>
                      <p className="text-sm text-yellow-700 mt-1">Review details carefully</p>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Reasoning - Admin Only */}
              {application?.ai_reasoning && (
                <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-indigo-900">AI Reasoning (Admin Only)</h4>
                  </div>
                  <div className="bg-white/70 rounded-lg p-4 border border-indigo-100">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                      {application.ai_reasoning}
                    </pre>
                  </div>
                  <p className="text-xs text-indigo-700 mt-2 flex items-center gap-1">
                    <Shield size={14} />
                    This reasoning is only visible to administrators
                  </p>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This is an AI recommendation. Final decision should be based on complete document verification and your professional judgment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X size={32} />
            </button>
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewDetail;