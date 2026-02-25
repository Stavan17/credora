import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LoanApplication from './pages/LoanApplication';
import ApplicationResult from './pages/ApplicationResult';

// New Pages
import DocumentUpload from './pages/DocumentUpload';
import LoanAnalysis from './pages/LoanAnalysis';
import FraudAnalysis from './pages/FraudAnalysis';
import AdminDashboard from './pages/AdminDashboard';
import AdminReviewDetail from './pages/AdminReviewDetail';
import AdminAnalytics from './pages/AdminAnalytics';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan-application"
            element={
              <ProtectedRoute>
                <LoanApplication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-upload/:applicationId"
            element={
              <ProtectedRoute>
                <DocumentUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan-analysis/:applicationId"
            element={
              <ProtectedRoute>
                <LoanAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fraud-analysis/:applicationId"
            element={
              <ProtectedRoute>
                <FraudAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/application-result/:id"
            element={
              <ProtectedRoute>
                <ApplicationResult />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/review/:applicationId"
            element={
              <ProtectedRoute>
                <AdminReviewDetail />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;