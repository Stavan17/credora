# Credora - Setup and Run Guide

This guide will help you set up and run the Credora project on your local machine.

## 📋 Prerequisites

### Backend Requirements
- Python 3.8 or higher
- PostgreSQL database
- pip (Python package manager)

### Frontend Requirements
- Node.js 16.x or higher
- npm or yarn

## 🗄️ Database Setup

### 1. Install PostgreSQL
- Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
- Remember your PostgreSQL password (you'll need it for the connection string)

### 2. Create Database
```sql
-- Open PostgreSQL command line or pgAdmin
CREATE DATABASE credora_db;
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd credora-backend
```

### 2. Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
Create a `.env` file in the `credora-backend` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/credora_db

# JWT Secret Key (generate a random string)
SECRET_KEY=your-super-secret-key-here-change-this-in-production

# JWT Algorithm
ALGORITHM=HS256

# Access Token Expiry (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Important**: Replace `username` and `password` with your PostgreSQL credentials.

### 5. Create Database Tables
The tables will be created automatically when you run the backend for the first time.

### 6. Clear Database Data (Optional)
If you need to delete all data and start fresh, you can use the `clear_database.py` script:

**Delete all data (keeps table structure):**
```bash
python clear_database.py
```

**Drop and recreate all tables (complete reset):**
```bash
python clear_database.py --drop
```

⚠️ **Warning**: This will permanently delete all data. Make sure you have backups if needed!

### 7. Create Admin User
```bash
python create_admin.py
```

This will create an admin user with:
- **Email**: `admin@credora.com`
- **Password**: `admin123`
- **Role**: Admin

⚠️ **Change the password after first login!**

### 8. Run Backend Server
```bash
# From credora-backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd credora-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Endpoint (if needed)
The frontend is configured to connect to `http://localhost:8000` by default.

If your backend runs on a different port, update `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:YOUR_PORT';
```

### 4. Run Frontend Development Server
```bash
npm start
```

The frontend will be available at: `http://localhost:3000`

## 🚀 Running the Complete Project

### Option 1: Run in Separate Terminals

**Terminal 1 - Backend:**
```bash
cd credora-backend
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd credora-frontend
npm start
```

### Option 2: Using PowerShell (Windows)

**Backend:**
```powershell
cd credora-backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Frontend (New PowerShell window):**
```powershell
cd credora-frontend
npm start
```

## ✅ Verify Installation

1. **Backend Health Check**: Visit `http://localhost:8000/health`
   - Should return: `{"status": "healthy", "database": "connected", ...}`

2. **Frontend**: Visit `http://localhost:3000`
   - Should show the login page

3. **API Docs**: Visit `http://localhost:8000/docs`
   - Should show Swagger UI with all API endpoints

## 🔐 Default Login Credentials

### Admin Account
- **Email**: `admin@credora.com`
- **Password**: `admin123`
- **Access**: Full admin dashboard, analytics, application review

### Regular User
- Register a new account from the registration page
- Or create via API/backend directly

## 📁 Project Structure

```
Credora/
├── credora-backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Database, security
│   │   ├── models/          # SQLAlchemy models
│   │   ├── services/        # Business logic (ML, fraud detection)
│   │   └── main.py          # FastAPI app
│   ├── uploads/             # Document storage
│   ├── requirements.txt     # Python dependencies
│   └── create_admin.py      # Admin user creation script
│
└── credora-frontend/        # React frontend
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── context/         # React contexts
    │   └── utils/           # Utilities
    └── package.json         # Node dependencies
```

## 🗄️ Database Management

### Clearing Database Data

If you want to delete all data and insert fresh data, you have two options:

#### Option 1: Delete All Data (Keeps Tables)
This removes all records but keeps the table structure intact:
```bash
cd credora-backend
python clear_database.py
```

This will delete:
- All users
- All loan applications
- All documents
- All fraud checks

#### Option 2: Drop and Recreate Tables (Complete Reset)
This completely removes and recreates all tables:
```bash
cd credora-backend
python clear_database.py --drop
```

⚠️ **Important Notes:**
- Both operations require confirmation before proceeding
- Make sure to backup important data before clearing
- After clearing, you'll need to run `python create_admin.py` again to create an admin user
- The script respects foreign key relationships and deletes data in the correct order

### Manual Database Reset (PostgreSQL)

You can also manually reset the database using PostgreSQL:

```sql
-- Connect to PostgreSQL
psql -U your_username -d credora_db

-- Drop all tables
DROP TABLE IF EXISTS fraud_checks CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS loan_applications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tables will be recreated automatically on next backend startup
```

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error:**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Ensure database `credora_db` exists

**Port Already in Use:**
- Change port: `uvicorn app.main:app --reload --port 8001`
- Or kill the process using port 8000

**Module Not Found:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

**Port 3000 Already in Use:**
- React will automatically suggest using port 3001
- Or set custom port: `PORT=3001 npm start`

**API Connection Failed:**
- Verify backend is running on port 8000
- Check CORS settings in backend
- Verify API_BASE_URL in `src/services/api.js`

**Dependencies Error:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Common Issues

**CORS Errors:**
- Backend CORS is configured for `http://localhost:3000`
- If using different port, update CORS in `app/main.py`

**ML Model Not Found:**
- Models should be in `app/ml_models/`
- If missing, the system will use rule-based fallback

## 📝 Environment Variables Summary

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/credora_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (Optional - if needed)
Create `.env` in `credora-frontend/`:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
```

## 🎯 Quick Start Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `credora_db` created
- [ ] Backend `.env` file configured
- [ ] Backend dependencies installed
- [ ] Backend virtual environment activated
- [ ] Admin user created (`python create_admin.py`)
- [ ] Backend server running (`uvicorn app.main:app --reload`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend server running (`npm start`)
- [ ] Both servers accessible (backend: 8000, frontend: 3000)

## 🔗 Useful URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📚 Next Steps

1. Login with admin credentials
2. Explore the admin dashboard
3. Register a new user account
4. Submit a loan application
5. View analytics dashboard
6. Test all the new features (dark mode, PDF export, etc.)

## 💡 Tips

- Keep both terminals open while developing
- Use `--reload` flag for auto-reload during development
- Check browser console for frontend errors
- Check terminal for backend errors
- Use API docs (`/docs`) to test endpoints directly

---

**Happy Coding! 🚀**

