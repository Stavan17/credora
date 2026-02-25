# Credora - Technology Stack & Tools

This document lists all the tools, libraries, and technologies used in the Credora project.

---

## 📦 Frontend Technologies

### **Core Framework**
- **React 19.2.0** - UI library
- **React DOM 19.2.0** - React rendering
- **React Router DOM 7.9.4** - Client-side routing

### **PDF Export**
- **jsPDF 2.5.2** - PDF generation library
  - Used for: Exporting application details and analytics reports to PDF
  - Location: `src/utils/pdfExport.js`
  - Features: Professional PDF formatting, headers, footers, multi-page support

### **Charts & Analytics Visualization**
- **Recharts 3.2.1** - React charting library
  - Used for: Analytics dashboard, risk matrix visualization
  - Chart types used:
    - `PieChart` - Application status distribution
    - `LineChart` - Applications over time
    - `BarChart` - Loan amount and CIBIL score distribution
    - `ScatterChart` - Risk matrix (2D visualization)
  - Components: `ResponsiveContainer`, `Tooltip`, `Legend`, `CartesianGrid`
  - Location: `src/pages/AdminAnalytics.js`, `src/components/RiskMatrix.js`

### **Notifications**
- **react-hot-toast 2.6.0** - Toast notification library
  - Used for: Success, error, info, and loading notifications
  - Replaces: Browser `alert()` calls
  - Features: Non-intrusive, customizable, auto-dismiss
  - Location: `src/utils/toast.js`

### **Internationalization (i18n)**
- **i18next 23.16.8** - Internationalization framework
- **react-i18next 13.5.0** - React bindings for i18next
  - Used for: Multi-language support (English, Hindi)
  - Features: Language switching, localStorage persistence
  - Location: `src/i18n/config.js`, `src/components/LanguageToggle.js`

### **State Management**
- **Zustand 4.5.7** - Lightweight state management
  - Available for future use (currently using React Context)

### **Icons**
- **lucide-react 0.545.0** - Icon library
  - Used for: All icons throughout the application
  - Examples: Dashboard icons, navigation icons, status indicators

### **Styling**
- **Tailwind CSS 3.3.0** - Utility-first CSS framework
  - Used for: All styling, responsive design, dark mode
  - Features: Dark mode support (`darkMode: 'class'`), utility classes
  - Location: `tailwind.config.js`

### **HTTP Client**
- **Axios 1.12.2** - HTTP client library
  - Used for: API calls to backend
  - Features: Request/response interceptors, automatic token injection
  - Location: `src/services/api.js`

### **Build Tools**
- **react-scripts 5.0.1** - Create React App scripts
- **PostCSS 8.4.31** - CSS processing
- **Autoprefixer 10.4.16** - CSS vendor prefixing

### **Testing** (Available)
- **@testing-library/react 16.3.0** - React testing utilities
- **@testing-library/jest-dom 6.9.1** - DOM matchers
- **@testing-library/user-event 13.5.0** - User interaction simulation

---

## 🔧 Backend Technologies

### **Core Framework**
- **FastAPI 0.104.1** - Modern Python web framework
  - Features: Automatic API documentation (Swagger/OpenAPI), async support
  - Location: `app/main.py`

### **Server**
- **Uvicorn 0.24.0** - ASGI server
  - Used for: Running FastAPI application

### **Database**
- **PostgreSQL** - Relational database
- **SQLAlchemy 2.0.23** - ORM (Object-Relational Mapping)
- **psycopg2-binary 2.9.9** - PostgreSQL adapter

### **Authentication & Security**
- **python-jose[cryptography] 3.3.0** - JWT token handling
- **passlib[bcrypt] 1.7.4** - Password hashing
  - Algorithm: bcrypt with 12 rounds

### **Data Validation**
- **Pydantic 2.5.0** - Data validation using Python type annotations

### **Machine Learning & Data Science**
- **scikit-learn 1.3.2** - Machine learning library
  - Used for: Random Forest model for loan approval prediction
- **XGBoost 2.0.2** - Gradient boosting framework (available)
- **pandas 2.1.3** - Data manipulation and analysis
- **numpy 1.26.2** - Numerical computing
- **joblib 1.3.2** - Model serialization (loading .pkl files)
- **SHAP 0.43.0** - Model explainability (available for future use)

### **Document Processing**
- **pytesseract 0.3.10** - OCR (Optical Character Recognition)
  - Available for: Document text extraction (future feature)
- **Pillow 10.1.0** - Image processing library

### **File Handling**
- **python-multipart 0.0.6** - File upload support

### **Configuration**
- **python-dotenv 1.0.0** - Environment variable management

---

## 🎨 UI/UX Tools & Features

### **Dark Mode**
- **Custom Implementation** - Using React Context + Tailwind CSS
  - Location: `src/context/ThemeContext.js`
  - Features: System preference detection, localStorage persistence

### **Password Strength Indicator**
- **Custom Component** - Built with React
  - Location: `src/components/PasswordStrength.js`
  - Features: Real-time validation, visual strength bar, requirement checklist

### **Risk Matrix Visualization**
- **Custom Component** - Built with Recharts ScatterChart
  - Location: `src/components/RiskMatrix.js`
  - Features: 2D visualization, interactive tooltips, quadrant classification

---

## 📊 Feature-to-Tool Mapping

| Feature | Tool/Library | Purpose |
|---------|--------------|---------|
| **PDF Export** | jsPDF | Generate PDF documents |
| **Analytics Charts** | Recharts | Data visualization |
| **Risk Matrix** | Recharts (ScatterChart) | 2D risk visualization |
| **Toast Notifications** | react-hot-toast | User feedback |
| **Internationalization** | i18next + react-i18next | Multi-language support |
| **Icons** | lucide-react | UI icons |
| **Styling** | Tailwind CSS | Responsive design, dark mode |
| **API Calls** | Axios | HTTP requests |
| **Routing** | React Router | Client-side navigation |
| **ML Predictions** | scikit-learn | Loan approval prediction |
| **Fraud Detection** | Custom Python logic | Rule-based fraud checks |
| **Authentication** | python-jose + passlib | JWT tokens, password hashing |
| **Database** | SQLAlchemy + PostgreSQL | Data persistence |

---

## 🔍 Detailed Tool Descriptions

### **jsPDF (PDF Export)**
```javascript
import jsPDF from 'jspdf';
```
- **What it does**: Generates PDF documents in the browser
- **Why we chose it**: Lightweight, no server-side processing needed, good documentation
- **Usage**: 
  - Export application details
  - Export analytics reports
- **Features used**:
  - Text formatting
  - Multi-page support
  - Headers and footers
  - Color and styling

### **Recharts (Analytics & Visualizations)**
```javascript
import { BarChart, LineChart, PieChart, ScatterChart } from 'recharts';
```
- **What it does**: React charting library built on D3.js
- **Why we chose it**: React-native, responsive, customizable, good performance
- **Usage**:
  - Analytics dashboard charts
  - Risk matrix scatter plot
- **Chart types**:
  - Pie charts for status distribution
  - Line charts for time series
  - Bar charts for distributions
  - Scatter charts for risk matrix

### **react-hot-toast (Notifications)**
```javascript
import toast from 'react-hot-toast';
```
- **What it does**: Beautiful, customizable toast notifications
- **Why we chose it**: Non-intrusive, customizable, better UX than alerts
- **Usage**: Success, error, info, and loading messages throughout the app

### **i18next (Internationalization)**
```javascript
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
```
- **What it does**: Enables multi-language support
- **Why we chose it**: Industry standard, React integration, easy to extend
- **Usage**: English and Hindi language support

### **scikit-learn (Machine Learning)**
```python
from sklearn.ensemble import RandomForestClassifier
import joblib
```
- **What it does**: Machine learning model for loan approval prediction
- **Why we chose it**: Reliable, well-documented, good for classification
- **Usage**: 
  - Load pre-trained Random Forest model
  - Predict loan approval probability
  - Feature importance analysis

---

## 🛠️ Development Tools

### **Version Control**
- Git (presumably)

### **Package Managers**
- **npm** - Node.js package manager (frontend)
- **pip** - Python package manager (backend)

### **Code Quality**
- **ESLint** - JavaScript linting (via react-scripts)
- **PostCSS** - CSS processing

---

## 📚 Additional Libraries (Available but not actively used)

- **XGBoost** - Alternative ML algorithm (available)
- **SHAP** - Model explainability (available for future use)
- **pytesseract** - OCR for document processing (available for future use)
- **Zustand** - State management (available for future use)

---

## 🌐 Deployment-Ready Tools

All tools used are production-ready and commonly used in industry:
- ✅ React - Industry standard
- ✅ FastAPI - Modern, fast Python framework
- ✅ PostgreSQL - Production-grade database
- ✅ jsPDF - Widely used PDF library
- ✅ Recharts - Popular charting solution
- ✅ Tailwind CSS - Modern CSS framework

---

## 📝 Summary

**Frontend Stack:**
- React + Tailwind CSS for UI
- Recharts for visualizations
- jsPDF for PDF generation
- react-hot-toast for notifications
- i18next for internationalization

**Backend Stack:**
- FastAPI for API
- PostgreSQL + SQLAlchemy for database
- scikit-learn for ML
- python-jose for authentication

**Key Tools for Features:**
- **PDF Export**: jsPDF
- **Analytics**: Recharts
- **Notifications**: react-hot-toast
- **i18n**: i18next
- **ML**: scikit-learn
- **Icons**: lucide-react

---

This technology stack provides a modern, scalable, and maintainable foundation for the Credora project! 🚀


