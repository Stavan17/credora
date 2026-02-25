import api from './api';

export const loanService = {
  // ============ EXISTING METHODS ============
  
  // Submit new loan application
  submitApplication: async (applicationData) => {
    const response = await api.post('/api/loan/apply', applicationData);
    return response.data;
  },

  // Process application (ML analysis)
  processApplication: async (applicationId) => {
    const response = await api.post(`/api/loan/process/${applicationId}`);
    return response.data;
  },

  // Get single application status
  getApplicationStatus: async (applicationId) => {
    const response = await api.get(`/api/loan/status/${applicationId}`);
    return response.data;
  },

  // Get all user's applications
  getMyApplications: async () => {
    const response = await api.get('/api/loan/my-applications');
    return response.data;
  },

  // ============ NEW METHODS - ADD THESE ============

  // Upload documents for an application
  uploadDocuments: async (applicationId, formData) => {
    const response = await api.post(`/api/loan/documents/${applicationId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all documents for an application
  getApplicationDocuments: async (applicationId) => {
    const response = await api.get(`/api/loan/documents/${applicationId}`);
    return response.data;
  },

  // Admin: Get all applications
  getAllApplications: async () => {
    const response = await api.get('/api/loan/admin/all-applications');
    return response.data;
  },

  // Admin: Review application (approve/reject)
  reviewApplication: async (applicationId, decision) => {
    const response = await api.post(`/api/loan/review/${applicationId}`, 
      new URLSearchParams({ decision }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },
};