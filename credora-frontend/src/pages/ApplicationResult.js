import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loanService } from '../services/loanService';
import { useAuth } from '../context/AuthContext';
import { exportApplicationToPDF } from '../utils/pdfExport';
import { showToast } from '../utils/toast';
import RiskMatrix from '../components/RiskMatrix';
import DarkModeToggle from '../components/DarkModeToggle';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Loader, TrendingUp, Shield, Download } from 'lucide-react';

const ApplicationResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const appData = await loanService.getApplicationStatus(id);
      setApplication(appData);

      if (appData.status === 'PENDING') {
        const processResult = await loanService.processApplication(id);
        const updatedApp = await loanService.getApplicationStatus(id);
        setApplication(updatedApp);
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('Failed to load application details');
      showToast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (application) {
      exportApplicationToPDF(application, user);
      showToast.success('Application exported to PDF!');
    }
  };

  const getDecisionIcon = (decision) => {
    switch (decision) {
      case 'APPROVED':
        return <CheckCircle className="text-green-600" size={48} />;
      case 'REJECTED':
        return <XCircle className="text-red-600" size={48} />;
      case 'MANUAL_REVIEW':
        return <AlertTriangle className="text-yellow-600" size={48} />;
      default:
        return <Loader className="text-gray-400" size={48} />;
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'APPROVED':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'REJECTED':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'MANUAL_REVIEW':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toLocaleString('en-IN');
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '₹0';
    return '₹' + Number(value).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Processing your application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto text-red-600 dark:text-red-400 mb-4" size={48} />
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{error || 'Application not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Results</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Application ID: #{application.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download size={20} />
              Export PDF
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Decision Card */}
        <div className={`border-2 rounded-xl p-8 ${getDecisionColor(application.final_decision)}`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getDecisionIcon(application.final_decision)}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {application.final_decision === 'APPROVED' && 'Congratulations! 🎉'}
              {application.final_decision === 'REJECTED' && 'Application Not Approved'}
              {application.final_decision === 'MANUAL_REVIEW' && 'Under Review'}
              {!application.final_decision && 'Processing...'}
            </h2>
            <p className="text-lg">
              {application.final_decision === 'APPROVED' && 'Your loan application has been approved!'}
              {application.final_decision === 'REJECTED' && 'Unfortunately, your application could not be approved at this time.'}
              {application.final_decision === 'MANUAL_REVIEW' && 'Your application requires manual review by our team.'}
              {!application.final_decision && 'Please wait while we process your application...'}
            </p>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Approval Probability */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Approval Probability</h3>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-4xl font-bold text-blue-600">
                  {application.approval_probability ? `${(application.approval_probability * 100).toFixed(1)}%` : '-'}
                </span>
              </div>
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-blue-100">
                <div
                  style={{ width: `${(application.approval_probability || 0) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {application.approval_probability >= 0.9 && '✓ Excellent chance of approval'}
                {application.approval_probability >= 0.7 && application.approval_probability < 0.9 && '✓ Good chance of approval'}
                {application.approval_probability >= 0.5 && application.approval_probability < 0.7 && '⚠ Moderate chance'}
                {application.approval_probability < 0.5 && '✗ Low chance of approval'}
              </p>
            </div>
          </div>

          {/* Fraud Risk */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-red-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Fraud Risk Score</h3>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-4xl font-bold text-red-600">
                  {application.fraud_score ? `${(application.fraud_score * 100).toFixed(1)}%` : '-'}
                </span>
              </div>
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-red-100">
                <div
                  style={{ width: `${(application.fraud_score || 0) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-600 transition-all duration-500"
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {application.fraud_score < 0.3 && '✓ Low fraud risk detected'}
                {application.fraud_score >= 0.3 && application.fraud_score < 0.7 && '⚠ Medium fraud risk'}
                {application.fraud_score >= 0.7 && '✗ High fraud risk detected'}
              </p>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Application Details</h3>
          
          {/* Personal Information */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Number of Dependents</p>
                <p className="text-lg font-semibold text-gray-900">{application.no_of_dependents || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Education</p>
                <p className="text-lg font-semibold text-gray-900">{application.education || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Employment Type</p>
                <p className="text-lg font-semibold text-gray-900">
                  {application.self_employed ? 'Self-Employed' : 'Salaried'}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Financial Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Annual Income</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(application.income_annum)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Loan Amount</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(application.loan_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Loan Term</p>
                <p className="text-lg font-semibold text-gray-900">
                  {application.loan_term || 0} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CIBIL Score</p>
                <p className="text-lg font-semibold text-gray-900">
                  {application.cibil_score || 'N/A'}
                  {application.cibil_score >= 750 && <span className="text-green-600 text-sm ml-2">Excellent</span>}
                  {application.cibil_score >= 650 && application.cibil_score < 750 && <span className="text-blue-600 text-sm ml-2">Good</span>}
                  {application.cibil_score >= 550 && application.cibil_score < 650 && <span className="text-yellow-600 text-sm ml-2">Fair</span>}
                  {application.cibil_score < 550 && <span className="text-red-600 text-sm ml-2">Poor</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Asset Values */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Asset Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Residential Assets</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(application.residential_assets_value || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Commercial Assets</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(application.commercial_assets_value || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Luxury Assets</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(application.luxury_assets_value || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bank Assets</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(application.bank_asset_value || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Assets */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-600">Total Assets Value</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(
                  (application.residential_assets_value || 0) +
                  (application.commercial_assets_value || 0) +
                  (application.luxury_assets_value || 0) +
                  (application.bank_asset_value || 0)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {application.final_decision && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Steps</h3>
            <ul className="space-y-2 text-blue-800">
              {application.final_decision === 'APPROVED' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <span>Our team will contact you within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <span>Please keep your documents ready for verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <span>You'll receive an email with further instructions</span>
                  </li>
                </>
              )}
              {application.final_decision === 'REJECTED' && (
                <>
                  <li>• Improve your CIBIL score before reapplying</li>
                  <li>• Consider applying for a smaller loan amount</li>
                  <li>• You can reapply after 3 months</li>
                </>
              )}
              {application.final_decision === 'MANUAL_REVIEW' && (
                <>
                  <li>⏳ Your application is under review</li>
                  <li>⏳ We may contact you for additional documents</li>
                  <li>⏳ Decision will be communicated within 3-5 business days</li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* Risk Matrix */}
        {application.approval_probability !== null && application.fraud_score !== null && (
          <div className="mt-6">
            <RiskMatrix
              loanScore={application.approval_probability}
              fraudScore={application.fraud_score}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/loan-application')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Submit New Application
          </button>
        </div>
      </main>
    </div>
  );
};

export default ApplicationResult;