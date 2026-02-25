import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader, Home } from 'lucide-react';
import { loanService } from '../services/loanService';

const FraudAnalysis = () => {
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
      setError('Failed to load fraud analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Analyzing fraud risk...</p>
        </div>
      </div>
    );
  }

  const fraudScore = data?.fraud_score || 0;
  const fraudPercent = (fraudScore * 100).toFixed(2);
  
  // Determine risk level
  const getRiskLevel = () => {
    if (fraudScore < 0.3) return { level: 'LOW', color: 'green', text: 'Low Risk' };
    if (fraudScore < 0.6) return { level: 'MEDIUM', color: 'yellow', text: 'Medium Risk' };
    return { level: 'HIGH', color: 'red', text: 'High Risk' };
  };

  const risk = getRiskLevel();

  const getGradientClass = () => {
    if (risk.color === 'green') return 'from-green-500 to-emerald-600';
    if (risk.color === 'yellow') return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getStatusIcon = () => {
    if (risk.color === 'green') return <Shield className="text-green-600" size={64} />;
    if (risk.color === 'yellow') return <AlertTriangle className="text-yellow-600" size={64} />;
    return <XCircle className="text-red-600" size={64} />;
  };

  const getStatusMessage = () => {
    if (risk.color === 'green') 
      return 'Excellent! Your application shows no significant fraud indicators.';
    if (risk.color === 'yellow') 
      return 'Some minor concerns detected. Additional verification may be required.';
    return 'Multiple fraud indicators detected. Your application will require thorough review.';
  };

  // Mock fraud flags (you'll get these from backend)
  const fraudFlags = [
    { detected: false, label: 'Income Verification', description: 'Income matches expected patterns' },
    { detected: false, label: 'Address Verification', description: 'Address details are consistent' },
    { detected: false, label: 'Identity Check', description: 'Identity documents verified' },
    { detected: false, label: 'Credit History', description: 'Credit history is normal' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="text-purple-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fraud Detection Analysis</h1>
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
            {/* Main Risk Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${getGradientClass()} p-8 text-white`}>
                <div className="text-center">
                  <div className="mb-4">{getStatusIcon()}</div>
                  <h2 className="text-3xl font-bold mb-2">{risk.text} Detected</h2>
                  <p className="text-white/90">{getStatusMessage()}</p>
                </div>
              </div>

              {/* Score Display */}
              <div className="p-12 text-center bg-gradient-to-b from-gray-50 to-white">
                <div className="mb-8">
                  <div className="text-8xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    {fraudPercent}%
                  </div>
                  <p className="text-2xl text-gray-600 font-medium">Fraud Risk Score</p>
                  <p className="text-sm text-gray-500 mt-2">Lower is better</p>
                </div>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r ${getGradientClass()} transition-all duration-1000 ease-out rounded-full shadow-lg`}
                      style={{ width: `${fraudPercent}%` }}
                    >
                      <div className="h-full w-full bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>0% (Safe)</span>
                    <span>50%</span>
                    <span>100% (High Risk)</span>
                  </div>
                </div>
              </div>

              {/* Risk Meter Visual */}
              <div className="p-8 bg-gray-50 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-6 text-lg text-center">Risk Assessment</h3>
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  <div className="text-center flex-1">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      risk.color === 'green' ? 'bg-green-100 ring-4 ring-green-500' : 'bg-green-50'
                    }`}>
                      <CheckCircle className={`${risk.color === 'green' ? 'text-green-600' : 'text-green-300'}`} size={32} />
                    </div>
                    <p className={`font-semibold ${risk.color === 'green' ? 'text-green-700' : 'text-gray-400'}`}>
                      Low Risk
                    </p>
                    <p className="text-xs text-gray-500 mt-1">0-30%</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      risk.color === 'yellow' ? 'bg-yellow-100 ring-4 ring-yellow-500' : 'bg-yellow-50'
                    }`}>
                      <AlertTriangle className={`${risk.color === 'yellow' ? 'text-yellow-600' : 'text-yellow-300'}`} size={32} />
                    </div>
                    <p className={`font-semibold ${risk.color === 'yellow' ? 'text-yellow-700' : 'text-gray-400'}`}>
                      Medium Risk
                    </p>
                    <p className="text-xs text-gray-500 mt-1">30-60%</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      risk.color === 'red' ? 'bg-red-100 ring-4 ring-red-500' : 'bg-red-50'
                    }`}>
                      <XCircle className={`${risk.color === 'red' ? 'text-red-600' : 'text-red-300'}`} size={32} />
                    </div>
                    <p className={`font-semibold ${risk.color === 'red' ? 'text-red-700' : 'text-gray-400'}`}>
                      High Risk
                    </p>
                    <p className="text-xs text-gray-500 mt-1">60-100%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Checks */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Security Checks</h3>
              <div className="space-y-4">
                {fraudFlags.map((check, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0">
                      {!check.detected ? (
                        <CheckCircle className="text-green-600" size={24} />
                      ) : (
                        <AlertTriangle className="text-red-600" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{check.label}</p>
                      <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      !check.detected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {!check.detected ? 'Passed' : 'Review Needed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition font-semibold text-lg shadow-lg"
              >
                <Home size={20} />
                Back to Dashboard
              </button>
            </div>

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Advanced Fraud Detection</h4>
                  <p className="text-sm text-blue-700">
                    Our AI-powered system analyzes multiple data points including income patterns, credit history, 
                    document authenticity, and behavioral indicators to protect against fraudulent applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudAnalysis;