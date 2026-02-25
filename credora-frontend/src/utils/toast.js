import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
    },
  }),
  
  error: (message) => toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
    },
  }),
  
  info: (message) => toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
    },
  }),
  
  loading: (message) => toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#6b7280',
      color: '#fff',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
    },
  }),
};

