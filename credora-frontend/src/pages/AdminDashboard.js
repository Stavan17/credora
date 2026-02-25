import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, FileText, TrendingUp, LogOut, Eye, Check, X, Clock, Search, BarChart3 } from 'lucide-react';
import { loanService } from '../services/loanService';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import DarkModeToggle from '../components/DarkModeToggle';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchAllApplications();
  }, []);

  const fetchAllApplications = async () => {
    try {
      // You'll need to create an admin endpoint to get all applications
      const data = await loanService.getAllApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (applicationId, decision) => {
    setProcessing(prev => ({ ...prev, [applicationId]: true }));
    try {
      await loanService.reviewApplication(applicationId, decision);
      showToast.success(`Application ${decision.toLowerCase()} successfully!`);
      // Refresh applications
      await fetchAllApplications();
    } catch (err) {
      showToast.error('Failed to update application');
    } finally {
      setProcessing(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'ALL' || app.status === filter;
    const matchesSearch = 
      app.id.toString().includes(searchTerm) ||
      app.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    underReview: applications.filter(app => app.status === 'UNDER_REVIEW').length,
    approved: applications.filter(app => app.status === 'APPROVED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
  };

  const getStatusBadge = (status) => {
    const configs = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'UNDER_REVIEW': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review' },
      'APPROVED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      'REJECTED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    const config = configs[status] || configs['PENDING'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Shield className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Credora Loan Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/analytics')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <BarChart3 size={20} />
                Analytics
              </button>
              <DarkModeToggle />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Under Review</p>
                <p className="text-3xl font-bold text-gray-900">{stats.underReview}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Eye className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Check className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <X className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === status
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                <p>No applications found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Applicant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Loan Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">CIBIL</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">AI Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Fraud Risk</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">#{app.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{app.user?.full_name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{app.user?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{app.loan_amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${
                          app.cibil_score >= 750 ? 'text-green-600' : 
                          app.cibil_score >= 650 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {app.cibil_score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {app.approval_probability ? (
                          <span className={`text-sm font-bold ${
                            app.approval_probability >= 0.7 ? 'text-green-600' : 
                            app.approval_probability >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {(app.approval_probability * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {app.fraud_score !== null ? (
                          <span className={`text-sm font-bold ${
                            app.fraud_score < 0.3 ? 'text-green-600' : 
                            app.fraud_score < 0.6 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {(app.fraud_score * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/review/${app.id}`)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {app.status === 'UNDER_REVIEW' && (
                            <>
                              <button
                                onClick={() => handleReview(app.id, 'APPROVED')}
                                disabled={processing[app.id]}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                                title="Approve"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleReview(app.id, 'REJECTED')}
                                disabled={processing[app.id]}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                                title="Reject"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;