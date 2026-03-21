import os
import shutil
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import SessionLocal
from app.models.loan_application import LoanApplication
from app.models.document import Document
import pytz

UPLOAD_DIR = "uploads/documents"

def cleanup_rejected_documents():
    print("🧹 Running scheduled task: cleanup_rejected_documents")
    db = SessionLocal()
    try:
        # 30 days ago, using UTC aware or naive depending on DB. 
        # Typically server_default=func.now() is naive in SQLite.
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        old_apps = db.query(LoanApplication).filter(
            LoanApplication.status == 'REJECTED',
            LoanApplication.updated_at < thirty_days_ago
        ).all()
        
        deleted_count = 0
        for app in old_apps:
            # Delete physical files directory
            app_dir = os.path.join(UPLOAD_DIR, f"app_{app.id}")
            if os.path.exists(app_dir):
                shutil.rmtree(app_dir)
                print(f"🧹 Removed physical directory for rejected app #{app.id}")
            
            # Delete Document records from DB to cascade cleanup
            db.query(Document).filter(Document.application_id == app.id).delete()
            deleted_count += 1
            
        db.commit()
        if deleted_count > 0:
            print(f"✅ Cleanup task completed. Processed and removed documents for {deleted_count} applications.")
        else:
            print("✅ Cleanup task completed. No old rejected applications found.")
    except Exception as e:
        print(f"❌ Error in cleanup task: {e}")
        db.rollback()
    finally:
        db.close()

scheduler = AsyncIOScheduler(timezone=pytz.UTC)
# Run once a day at midnight
scheduler.add_job(cleanup_rejected_documents, 'cron', hour=0, id='cleanup_job')
