import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrendingUp, CheckCircle, AlertTriangle, ArrowRight, Loader } from 'lucide-react';
import { loanService } from '../services/loanService';

const LoanAnalysis = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [applicationId]);

  const fetchAnalysis = async () => {
    try {
      const result = await loanService.getApplicationStatus(applicationId);
      setData(result);
    } catch (err) {
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Analyzing your application...</p>
        </div>
      </div>
    );
  }

  const approvalProb = data?.approval_probability || 0;
  const approvalPercent = (approvalProb * 100).toFixed(2);
  
  // Determine color based on probability
  const getColorClass = () => {
    if (approvalProb >= 0.7) return 'from-green-500 to-emerald-600';
    if (approvalProb >= 0.4) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getStatusIcon = () => {
    if (approvalProb >= 0.7) return <CheckCircle className="text-green-600" size={64} />;
    if (approvalProb >= 0.4) return <AlertTriangle className="text-yellow-600" size={64} />;
    return <AlertTriangle className="text-red-600" size={64} />;
  };

  const getStatusText = () => {
    if (approvalProb >= 0.7) return 'High Approval Probability';
    if (approvalProb >= 0.4) return 'Moderate Approval Probability';
    return 'Low Approval Probability';
  };

  const getStatusMessage = () => {
    if (approvalProb >= 0.7) return 'Great news! Your application shows strong indicators for approval.';
    if (approvalProb >= 0.4) return 'Your application requires careful review. Additional verification may be needed.';
    return 'Your application shows some concerns. Our team will review it carefully.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loan Approval Analysis</h1>
              <p className="text-sm text-gray-600">Application #{applicationId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Score Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${getColorClass()} p-8 text-white`}>
                <div className="text-center">
                  <div className="mb-4">{getStatusIcon()}</div>
                  <h2 className="text-3xl font-bold mb-2">{getStatusText()}</h2>
                  <p className="text-white/90">{getStatusMessage()}</p>
                </div>
              </div>

              {/* Score Display */}
              <div className="p-12 text-center bg-gradient-to-b from-gray-50 to-white">
                <div className="mb-8">
                  <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {approvalPercent}%
                  </div>
                  <p className="text-2xl text-gray-600 font-medium">Approval Probability</p>
                </div>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r ${getColorClass()} transition-all duration-1000 ease-out rounded-full shadow-lg`}
                      style={{ width: `${approvalPercent}%` }}
                    >
                      <div className="h-full w-full bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="p-8 bg-gray-50 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Application Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{data?.loan_amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Annual Income</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{data?.income_annum?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">CIBIL Score</p>
                    <p className="text-lg font-bold text-gray-900">{data?.cibil_score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Loan Term</p>
                    <p className="text-lg font-bold text-gray-900">{data?.loan_term} years</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Fraud Detection Analysis</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Review your fraud risk assessment to understand security checks
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Admin Review</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Our team will review your application and documents within 24-48 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Final Decision</p>
                    <p className="text-sm text-gray-600 mt-1">
                      You'll receive notification about the final decision via email and dashboard
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/fraud-analysis/${applicationId}`)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold text-lg shadow-lg"
              >
                View Fraud Analysis
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold text-lg"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is an AI-generated probability based on your application data. 
                The final decision will be made by our loan approval team after reviewing all documents and conducting necessary verifications.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanAnalysis;