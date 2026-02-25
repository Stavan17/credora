"""
Quick fix script to update database schema
This will drop and recreate all tables with the latest schema
"""

import sys
from app.core.database import engine, Base
from app.models.user import User
from app.models.loan_application import LoanApplication
from app.models.document import Document
from app.models.fraud_check import FraudCheck

def fix_schema():
    """Drop and recreate all tables with latest schema"""
    
    print("=" * 60)
    print("🔧 Fixing Database Schema")
    print("=" * 60)
    print("\n⚠️  WARNING: This will DROP all tables and recreate them!")
    print("   All existing data will be lost.\n")
    
    response = input("Are you sure you want to continue? (yes/no): ")
    if response.lower() not in ["yes", "y"]:
        print("❌ Operation cancelled.")
        return
    
    try:
        print("\n🗑️  Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("   ✅ All tables dropped")
        
        print("\n🔨 Recreating all tables with latest schema...")
        Base.metadata.create_all(bind=engine)
        print("   ✅ All tables recreated with latest schema")
        
        print("\n✅ Database schema fixed successfully!")
        print("   All tables now include the ai_reasoning column.")
        print("\n💡 Next steps:")
        print("   1. Run 'python create_admin.py' to create admin user")
        print("   2. Restart your backend server")
        
    except Exception as e:
        print(f"\n❌ Error fixing schema: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    fix_schema()
