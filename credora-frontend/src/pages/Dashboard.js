import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loanService } from '../services/loanService';
import { showToast } from '../utils/toast';
import { exportApplicationToPDF } from '../utils/pdfExport';
import DarkModeToggle from '../components/DarkModeToggle';
import { FileText, TrendingUp, LogOut, PlusCircle, AlertCircle, Clock, Download } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await loanService.getMyApplications();
      setApplications(data);
    } catch (err) {
      setError('Failed to load applications');
      showToast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'MANUAL_REVIEW':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'PENDING':
        return 'Pending';
      case 'MANUAL_REVIEW':
        return 'Manual Review';
      default:
        return status || 'Unknown';
    }
  };

  const handleExportPDF = (app) => {
    exportApplicationToPDF(app, user);
    showToast.success('Application exported to PDF!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credora Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user?.full_name || 'User'}!</p>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {applications.filter(app => app.status === 'APPROVED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {applications.filter(app => app.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Under Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {applications.filter(app => app.status === 'UNDER_REVIEW').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* New Application Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/loan-application')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <PlusCircle size={20} />
            New Loan Application
          </button>
        </div>

        {/* Applications List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Applications</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading applications...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No applications yet. Apply for your first loan!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Loan Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Annual Income</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">CIBIL Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">AI Recommendation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Approval %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{app.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">₹{app.loan_amount?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">₹{app.income_annum?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {app.cibil_score || 'N/A'}
                        {app.cibil_score >= 750 && <span className="text-green-600 dark:text-green-400 text-xs ml-1">★</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {app.status === 'UNDER_REVIEW' || app.status === 'APPROVED' || app.status === 'REJECTED' ? (
                          app.final_decision ? (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              app.final_decision === 'APPROVED' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                              app.final_decision === 'REJECTED' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 
                              'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            }`}>
                              {app.final_decision === 'APPROVED' ? 'Shall be Approved' : 
                               app.final_decision === 'REJECTED' ? 'Shall be Rejected' : 
                               'Under Review'}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">Processing...</span>
                          )
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs">Not yet analyzed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {app.approval_probability ? (
                          <span className={`font-semibold ${
                            app.approval_probability >= 0.7 ? 'text-green-600 dark:text-green-400' : 
                            app.approval_probability >= 0.4 ? 'text-yellow-600 dark:text-yellow-400' : 
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {(app.approval_probability * 100).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/application-result/${app.id}`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleExportPDF(app)}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            title="Export to PDF"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;