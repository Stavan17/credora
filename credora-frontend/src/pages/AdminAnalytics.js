import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loanService } from '../services/loanService';
import { exportAnalyticsToPDF } from '../utils/pdfExport';
import { showToast } from '../utils/toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ArrowLeft,
  DollarSign,
  Shield,
} from 'lucide-react';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const data = await loanService.getAllApplications();
      setApplications(data);
    } catch (err) {
      showToast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (apps) => {
    if (!timeRange) return apps;
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return apps.filter(app => new Date(app.created_at) >= cutoffDate);
  };

  const filteredApps = filterByTimeRange(applications);

  // Calculate statistics
  const stats = {
    total: filteredApps.length,
    approved: filteredApps.filter(app => app.status === 'APPROVED').length,
    rejected: filteredApps.filter(app => app.status === 'REJECTED').length,
    pending: filteredApps.filter(app => app.status === 'PENDING').length,
    underReview: filteredApps.filter(app => app.status === 'UNDER_REVIEW').length,
    totalLoanAmount: filteredApps.reduce((sum, app) => sum + (app.loan_amount || 0), 0),
    avgLoanAmount: filteredApps.length > 0
      ? filteredApps.reduce((sum, app) => sum + (app.loan_amount || 0), 0) / filteredApps.length
      : 0,
    avgApprovalProb: filteredApps.filter(app => app.approval_probability !== null).length > 0
      ? filteredApps
          .filter(app => app.approval_probability !== null)
          .reduce((sum, app) => sum + (app.approval_probability || 0), 0) /
        filteredApps.filter(app => app.approval_probability !== null).length
      : 0,
    avgFraudScore: filteredApps.filter(app => app.fraud_score !== null).length > 0
      ? filteredApps
          .filter(app => app.fraud_score !== null)
          .reduce((sum, app) => sum + (app.fraud_score || 0), 0) /
        filteredApps.filter(app => app.fraud_score !== null).length
      : 0,
  };

  const approvalRate = stats.total > 0 ? (stats.approved / stats.total) * 100 : 0;
  const rejectionRate = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;

  // Prepare chart data
  const statusData = [
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Under Review', value: stats.underReview, color: '#3b82f6' },
  ];

  // Applications over time
  const timeSeriesData = React.useMemo(() => {
    const days = parseInt(timeRange) || 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayApps = filteredApps.filter(app => {
        const appDate = new Date(app.created_at).toISOString().split('T')[0];
        return appDate === dateStr;
      });

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: dayApps.length,
        approved: dayApps.filter(app => app.status === 'APPROVED').length,
        rejected: dayApps.filter(app => app.status === 'REJECTED').length,
      });
    }
    return data;
  }, [filteredApps, timeRange]);

  // Loan amount distribution
  const loanAmountRanges = [
    { range: '0-1L', min: 0, max: 100000, count: 0 },
    { range: '1L-5L', min: 100000, max: 500000, count: 0 },
    { range: '5L-10L', min: 500000, max: 1000000, count: 0 },
    { range: '10L-25L', min: 1000000, max: 2500000, count: 0 },
    { range: '25L+', min: 2500000, max: Infinity, count: 0 },
  ];

  filteredApps.forEach(app => {
    const amount = app.loan_amount || 0;
    const range = loanAmountRanges.find(r => amount >= r.min && amount < r.max);
    if (range) range.count++;
  });

  const loanAmountData = loanAmountRanges.map(r => ({
    range: r.range,
    count: r.count,
  }));

  // CIBIL score distribution
  const cibilRanges = [
    { range: '300-500', min: 300, max: 500, count: 0 },
    { range: '500-650', min: 500, max: 650, count: 0 },
    { range: '650-750', min: 650, max: 750, count: 0 },
    { range: '750-900', min: 750, max: 900, count: 0 },
  ];

  filteredApps.forEach(app => {
    const score = app.cibil_score || 0;
    const range = cibilRanges.find(r => score >= r.min && score < r.max);
    if (range) range.count++;
  });

  const cibilData = cibilRanges.map(r => ({
    range: r.range,
    count: r.count,
  }));

  const handleExportPDF = () => {
    exportAnalyticsToPDF(stats);
    showToast.success('Analytics report exported successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft className="text-gray-600 dark:text-gray-300" size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive insights and metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="">All time</option>
              </select>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={20} />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {approvalRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Loan Amount</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  ₹{(stats.totalLoanAmount / 100000).toFixed(1)}L
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Approval Prob</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {(stats.avgApprovalProb * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Shield className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Application Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Applications Over Time */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Applications Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
                <Line type="monotone" dataKey="approved" stroke="#10b981" name="Approved" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Loan Amount Distribution */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Loan Amount Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loanAmountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CIBIL Score Distribution */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">CIBIL Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cibilData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              <h4 className="font-semibold text-gray-900 dark:text-white">Approved</h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {approvalRate.toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="text-red-600 dark:text-red-400" size={24} />
              <h4 className="font-semibold text-gray-900 dark:text-white">Rejected</h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {rejectionRate.toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              <h4 className="font-semibold text-gray-900 dark:text-white">In Review</h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.pending + stats.underReview}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Pending review
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;

