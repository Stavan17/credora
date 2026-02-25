import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      welcome: 'Welcome',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      dashboard: 'Dashboard',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      
      // Auth
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      signIn: 'Sign in',
      signUp: 'Sign Up',
      
      // Dashboard
      totalApplications: 'Total Applications',
      approved: 'Approved',
      pending: 'Pending',
      underReview: 'Under Review',
      newLoanApplication: 'New Loan Application',
      yourApplications: 'Your Applications',
      viewDetails: 'View Details',
      
      // Application
      applicationId: 'Application ID',
      loanAmount: 'Loan Amount',
      annualIncome: 'Annual Income',
      cibilScore: 'CIBIL Score',
      status: 'Status',
      aiRecommendation: 'AI Recommendation',
      approvalPercentage: 'Approval %',
      
      // Admin
      adminDashboard: 'Admin Dashboard',
      analytics: 'Analytics',
      allApplications: 'All Applications',
      
      // Messages
      documentsUploaded: 'Documents uploaded successfully!',
      applicationSubmitted: 'Application submitted successfully!',
      failedToLoad: 'Failed to load',
    },
  },
  hi: {
    translation: {
      // Common
      welcome: 'स्वागत है',
      logout: 'लॉग आउट',
      login: 'लॉग इन',
      register: 'रजिस्टर करें',
      dashboard: 'डैशबोर्ड',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफल',
      
      // Auth
      email: 'ईमेल पता',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      fullName: 'पूरा नाम',
      createAccount: 'खाता बनाएं',
      alreadyHaveAccount: 'पहले से खाता है?',
      signIn: 'साइन इन करें',
      signUp: 'साइन अप करें',
      
      // Dashboard
      totalApplications: 'कुल आवेदन',
      approved: 'अनुमोदित',
      pending: 'लंबित',
      underReview: 'समीक्षा के अधीन',
      newLoanApplication: 'नया ऋण आवेदन',
      yourApplications: 'आपके आवेदन',
      viewDetails: 'विवरण देखें',
      
      // Application
      applicationId: 'आवेदन आईडी',
      loanAmount: 'ऋण राशि',
      annualIncome: 'वार्षिक आय',
      cibilScore: 'CIBIL स्कोर',
      status: 'स्थिति',
      aiRecommendation: 'AI सिफारिश',
      approvalPercentage: 'अनुमोदन %',
      
      // Admin
      adminDashboard: 'एडमिन डैशबोर्ड',
      analytics: 'विश्लेषण',
      allApplications: 'सभी आवेदन',
      
      // Messages
      documentsUploaded: 'दस्तावेज सफलतापूर्वक अपलोड किए गए!',
      applicationSubmitted: 'आवेदन सफलतापूर्वक जमा किया गया!',
      failedToLoad: 'लोड करने में विफल',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

