from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import engine, Base
import os

# ✅ CRITICAL: Import ALL models BEFORE creating tables
# This ensures SQLAlchemy knows about all relationships
from app.models.user import User
from app.models.document import Document
from app.models.fraud_check import FraudCheck
from app.models.loan_application import LoanApplication

# Now create tables - order matters!
Base.metadata.create_all(bind=engine)

# Import routers AFTER models
from app.api import auth, loan

app = FastAPI(
    title="Credora API",
    description="AI-powered Loan & Fraud Risk Intelligence System",
    version="1.0.0"
)

# CORS Configuration - Must be before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Alternative port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files as static files
# This allows frontend to access documents via URLs
uploads_path = "uploads"
if os.path.exists(uploads_path):
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")
    print(f"✅ Serving static files from: {uploads_path}")
else:
    print(f"⚠️ Warning: {uploads_path} directory not found. Creating it...")
    os.makedirs(uploads_path, exist_ok=True)
    os.makedirs(os.path.join(uploads_path, "documents"), exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")
    print(f"✅ Created and serving static files from: {uploads_path}")

# Include routers
app.include_router(auth.router)
app.include_router(loan.router)

@app.get("/")
async def root():
    return {
        "message": "Credora API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "auth": "/api/auth",
            "loan": "/api/loan"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "uploads_directory": os.path.exists("uploads")
    }

# Optional: Add startup event to verify configuration
@app.on_event("startup")
async def startup_event():
    print("\n" + "="*60)
    print("🚀 Credora API Starting Up")
    print("="*60)
    print(f"📁 Uploads directory: {os.path.abspath('uploads')}")
    print(f"✅ Static files mounted at: /uploads")
    print(f"🌐 API Documentation: http://localhost:8000/docs")
    print(f"💻 Frontend should be at: http://localhost:3000")
    print("="*60 + "\n")

# Optional: Add shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    print("\n👋 Credora API Shutting Down\n")