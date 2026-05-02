import os
import sys
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import User
from app.models.loan_application import LoanApplication
from app.models.document import Document
from app.api.loan import _run_processing_pipeline

def create_hiral_case():
    db = SessionLocal()
    try:
        # 1. Create User Hiral if not exists
        user = db.query(User).filter(User.email == "hiral@example.com").first()
        if not user:
            user = User(
                email="hiral@example.com",
                full_name="Hiral Pan Card",
                hashed_password="hashed_password", # Dummy
                is_admin=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"✅ User {user.full_name} created.")
        else:
            print(f"ℹ️ User {user.full_name} already exists.")

        # 2. Create Loan Application
        application = LoanApplication(
            user_id=user.id,
            no_of_dependents=2,
            income_annum=850000,
            loan_amount=450000,
            loan_term=5,
            cibil_score=720,
            residential_assets_value=1200000,
            commercial_assets_value=0,
            luxury_assets_value=50000,
            bank_asset_value=200000,
            education="Graduate",
            self_employed=False,
            status="PENDING"
        )
        db.add(application)
        db.commit()
        db.refresh(application)
        print(f"✅ Application #{application.id} created for Hiral.")

        # 3. Create Application Directory and Dummy Files
        upload_dir = os.path.join("uploads", "documents", f"app_{application.id}")
        os.makedirs(upload_dir, exist_ok=True)

        docs_to_create = [
            ("identity_proof", "hiral_pan_card.jpg", "PAN Card Hiral Kumar. ID: ABCP1234M. Govt of India."),
            ("address_proof", "hiral_aadhar_card.jpg", "Aadhar Card. Name: Hiral Kumar. Address: 123 Street, Mumbai, Maharashtra 400001."),
            ("income_proof", "salary_certificate.jpg", "Salary Certificate. 27-Mar-2026 14-45-00. Hiral Kumar. Net Monthly: 70000."),
            ("photo", "dark_selfie.jpg", "") # Dark selfie, no OCR text expected
        ]

        # Use a simple way to create dummy files
        for doc_type, filename, ocr_text in docs_to_create:
            file_path = os.path.abspath(os.path.join(upload_dir, filename))
            
            # Create a dummy image file (1x1 black pixels or just empty)
            with open(file_path, "wb") as f:
                # A very small valid-ish JPEG header or just some data
                f.write(b"\xff\xd8\xff\xdb\x00\x43\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01\x01\x00\x00\x3f\x00\x00\xff\xd9")

            # Create Document record
            new_doc = Document(
                application_id=application.id,
                document_type=doc_type,
                file_name=filename,
                file_path=file_path,
                ocr_extracted_text=ocr_text,
                is_verified=True
            )
            db.add(new_doc)
            print(f"📄 Document {doc_type} linked.")

        db.commit()

        # 4. Trigger Processing Pipeline
        print("⚙️ Running ML/Fraud processing pipeline...")
        db.refresh(application)
        _run_processing_pipeline(application, db)
        
        print(f"✨ SUCCESS! Case for Hiral created.")
        print(f"   Application ID: {application.id}")
        print(f"   Status: {application.status}")
        print(f"   Final Decision: {application.final_decision}")
        print(f"   Fraud Score: {application.fraud_score}")
        print(f"   AI Reasoning: \n{application.ai_reasoning}")

    except Exception as e:
        print(f"❌ Error creating case: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_hiral_case()
