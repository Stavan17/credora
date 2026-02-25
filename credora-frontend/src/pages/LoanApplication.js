import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../services/loanService';
import { ArrowLeft, Send, AlertCircle, Loader, DollarSign, Home, Briefcase, Gem, Building2 } from 'lucide-react';

const LoanApplication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Personal Information
    no_of_dependents: '0',
    education: 'Graduate',
    self_employed: false,
    
    // Financial Information
    income_annum: '',
    loan_amount: '',
    loan_term: '5',
    cibil_score: '',
    
    // Asset Values
    residential_assets_value: '0',
    commercial_assets_value: '0',
    luxury_assets_value: '0',
    bank_asset_value: '0'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert string values to appropriate types
      const applicationData = {
        no_of_dependents: parseInt(formData.no_of_dependents),
        income_annum: parseFloat(formData.income_annum),
        loan_amount: parseFloat(formData.loan_amount),
        loan_term: parseInt(formData.loan_term),
        // CIBIL score will be auto-fetched by backend
        residential_assets_value: parseFloat(formData.residential_assets_value) || 0,
        commercial_assets_value: parseFloat(formData.commercial_assets_value) || 0,
        luxury_assets_value: parseFloat(formData.luxury_assets_value) || 0,
        bank_asset_value: parseFloat(formData.bank_asset_value) || 0,
        education: formData.education,
        self_employed: formData.self_employed
      };

      // Submit application
      const result = await loanService.submitApplication(applicationData);
      
      // Process the application immediately
      await loanService.processApplication(result.application_id);
      
      // Navigate to document upload page instead of results
      navigate(`/document-upload/${result.application_id}`);
      
    } catch (err) {
      console.error('Application error:', err);
      setError(err.response?.data?.detail || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Loan Application</h1>
            <p className="text-sm text-gray-600">Fill in all required details below</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>Personal Information</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Dependents *
                  </label>
                  <select
                    name="no_of_dependents"
                    value={formData.no_of_dependents}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education *
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Graduate">Graduate</option>
                    <option value="Not Graduate">Not Graduate</option>
                  </select>
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    name="self_employed"
                    checked={formData.self_employed}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Self Employed
                  </label>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                <span>Financial Information</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income (₹) *
                  </label>
                  <input
                    type="number"
                    name="income_annum"
                    value={formData.income_annum}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000000"
                    required
                    min="0"
                    step="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your yearly income</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="loan_amount"
                    value={formData.loan_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2000000"
                    required
                    min="0"
                    step="10000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Amount you want to borrow</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term (Years) *
                  </label>
                  <select
                    name="loan_term"
                    value={formData.loan_term}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="2">2 years</option>
                    <option value="3">3 years</option>
                    <option value="4">4 years</option>
                    <option value="5">5 years</option>
                    <option value="6">6 years</option>
                    <option value="7">7 years</option>
                    <option value="8">8 years</option>
                    <option value="9">9 years</option>
                    <option value="10">10 years</option>
                    <option value="15">15 years</option>
                    <option value="20">20 years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CIBIL Score
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Will be automatically fetched</p>
                      <p className="text-xs text-gray-500 mt-1">Credit score retrieved from CIBIL database</p>
                    </div>
                    <div className="text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Values */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Building2 size={20} />
                <span>Asset Information</span>
              </h2>
              <p className="text-sm text-gray-600 mb-4">Optional - Enter 0 if you don't have these assets</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Home size={16} />
                    Residential Assets Value (₹)
                  </label>
                  <input
                    type="number"
                    name="residential_assets_value"
                    value={formData.residential_assets_value}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="10000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Value of residential properties</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Briefcase size={16} />
                    Commercial Assets Value (₹)
                  </label>
                  <input
                    type="number"
                    name="commercial_assets_value"
                    value={formData.commercial_assets_value}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="10000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Value of commercial properties</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Gem size={16} />
                    Luxury Assets Value (₹)
                  </label>
                  <input
                    type="number"
                    name="luxury_assets_value"
                    value={formData.luxury_assets_value}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="10000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Jewelry, vehicles, art, etc.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Bank Assets Value (₹)
                  </label>
                  <input
                    type="number"
                    name="bank_asset_value"
                    value={formData.bank_asset_value}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Savings, FD, investments, etc.</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoanApplication;