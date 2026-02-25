"""
Migration script to add ai_reasoning column to loan_applications table
Run this once to update your existing database schema
"""

from sqlalchemy import text
from app.core.database import engine, SessionLocal

def add_ai_reasoning_column():
    """Add ai_reasoning column to loan_applications table"""
    
    db = SessionLocal()
    
    try:
        print("🔄 Adding ai_reasoning column to loan_applications table...")
        
        # Check if column already exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='loan_applications' AND column_name='ai_reasoning'
        """)
        
        result = db.execute(check_query).fetchone()
        
        if result:
            print("✅ Column 'ai_reasoning' already exists. No migration needed.")
            return
        
        # Add the column (use TEXT for longer content)
        alter_query = text("""
            ALTER TABLE loan_applications 
            ADD COLUMN ai_reasoning TEXT
        """)
        
        db.execute(alter_query)
        db.commit()
        
        print("✅ Successfully added 'ai_reasoning' column to loan_applications table!")
        print("   The column is now available for storing AI reasoning.")
        
    except Exception as e:
        print(f"❌ Error adding column: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Database Migration: Adding ai_reasoning Column")
    print("=" * 60)
    add_ai_reasoning_column()
    print("=" * 60)
    print("✅ Migration complete!")
