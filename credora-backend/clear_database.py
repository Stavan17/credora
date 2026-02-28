"""
Script to clear all data from the database
Use this when you want to start fresh with clean data

Usage:
    python clear_database.py          # Delete all data, keep tables
    python clear_database.py --drop   # Drop and recreate all tables
"""

import sys
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.loan_application import LoanApplication
from app.models.document import Document
from app.models.fraud_check import FraudCheck

def clear_all_data():
    """Delete all data from all tables (keeps table structure)"""
    
    db = SessionLocal()
    
    try:
        print("Clearing all data from database...")
        
        # Delete in correct order to respect foreign key constraints
        # 1. FraudChecks (references loan_applications)
        fraud_count = db.query(FraudCheck).count()
        db.query(FraudCheck).delete()
        print(f"   Deleted {fraud_count} fraud check(s)")
        
        # 2. Documents (references loan_applications)
        doc_count = db.query(Document).count()
        db.query(Document).delete()
        print(f"   Deleted {doc_count} document(s)")
        
        # 3. LoanApplications (references users)
        loan_count = db.query(LoanApplication).count()
        db.query(LoanApplication).delete()
        print(f"   Deleted {loan_count} loan application(s)")
        
        # 4. Users (no dependencies)
        user_count = db.query(User).count()
        db.query(User).delete()
        print(f"   Deleted {user_count} user(s)")
        
        db.commit()
        print("\nAll data cleared successfully!")
        print("   Tables are still intact. You can now insert fresh data.")
        
    except Exception as e:
        print(f"Error clearing data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def drop_and_recreate_tables():
    """Drop all tables and recreate them (complete reset)"""
    
    try:
        print("Dropping all tables...")
        
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        print("   All tables dropped")
        
        print("Recreating all tables...")
        
        # Recreate all tables
        Base.metadata.create_all(bind=engine)
        print("   All tables recreated")
        
        print("\nDatabase reset complete!")
        print("   All tables have been dropped and recreated.")
        print("   You can now insert fresh data.")
        
    except Exception as e:
        print(f"Error resetting database: {e}")
        raise

def main():
    """Main function"""
    
    # Check for --drop flag
    drop_tables = "--drop" in sys.argv or "-d" in sys.argv
    
    if drop_tables:
        print("WARNING: This will DROP all tables and recreate them!")
        print("   All data and table structure will be lost.\n")
        
        response = input("Are you sure you want to continue? (yes/no): ")
        if response.lower() not in ["yes", "y"]:
            print("Operation cancelled.")
            return
        
        drop_and_recreate_tables()
    else:
        print("WARNING: This will DELETE all data from all tables!")
        print("   Table structure will be preserved.\n")
        
        response = input("Are you sure you want to continue? (yes/no): ")
        if response.lower() not in ["yes", "y"]:
            print("Operation cancelled.")
            return
        
        clear_all_data()
    
    print("\nTip: Run 'python create_admin.py' to create an admin user.")

if __name__ == "__main__":
    main()
