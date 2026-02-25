"""
Script to create an admin user
Run this once to create your admin account
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash

def create_admin_user():
    """Create an admin user"""
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Admin credentials
        admin_email = "admin@credora.com"
        admin_password = "admin123"  # Change this!
        admin_name = "Admin User"
        
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print(f"❌ Admin user already exists: {admin_email}")
            
            # Update to admin if not already
            if not existing_admin.is_admin:
                existing_admin.is_admin = True
                db.commit()
                print(f"✅ Updated {admin_email} to admin role")
            return
        
        # Create new admin user
        admin_user = User(
            email=admin_email,
            full_name=admin_name,
            hashed_password=get_password_hash(admin_password),
            is_admin=True  # ← Make admin
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"   Name: {admin_name}")
        print(f"   Admin: {admin_user.is_admin}")
        print("\n⚠️  IMPORTANT: Change the admin password after first login!")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Creating admin user...")
    create_admin_user()
    print("✅ Done!")