from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime
from app.core.database import get_db
from app.core.security import decode_token, oauth2_scheme
from app.models.loan_application import LoanApplication
from app.models.fraud_check import FraudCheck
from app.models.document import Document
from app.models.user import User
from app.schemas.loan import LoanApplicationCreate, LoanApplicationResponse
from app.services.ml_service import ml_service
from app.services.fraud_service import fraud_service
from app.services.risk_service import risk_service
from app.services.cibil_service import cibil_service
from app.services.ocr_service import ocr_service
from app.api.websocket import manager
import traceback
import json

router = APIRouter(prefix="/api/loan", tags=["Loan Application"])

# Create upload directory if it doesn't exist
UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_admin_user(current_user: User = Depends(get_current_user)):
    """Check if current user is admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403, 
            detail="Access denied. Admin privileges required."
        )
    return current_user

@router.post("/apply", response_model=dict)
async def submit_loan_application(
    application: LoanApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a new loan application"""
    
    try:
        # Validate education field
        if application.education not in ["Graduate", "Not Graduate"]:
            raise HTTPException(status_code=400, detail="Education must be 'Graduate' or 'Not Graduate'")
        
        # Auto-fetch CIBIL score if not provided
        if application.cibil_score is None:
            cibil_result = cibil_service.get_cibil_score(
                email=current_user.email,
                full_name=current_user.full_name
            )
            cibil_score = cibil_result['cibil_score']
            print(f"✅ Auto-fetched CIBIL score for {current_user.email}: {cibil_score}")
        else:
            cibil_score = application.cibil_score
        
        # Create application record with PENDING status
        new_application = LoanApplication(
            user_id=current_user.id,
            no_of_dependents=application.no_of_dependents,
            income_annum=application.income_annum,
            loan_amount=application.loan_amount,
            loan_term=application.loan_term,
            cibil_score=cibil_score,
            residential_assets_value=application.residential_assets_value,
            commercial_assets_value=application.commercial_assets_value,
            luxury_assets_value=application.luxury_assets_value,
            bank_asset_value=application.bank_asset_value,
            education=application.education,
            self_employed=application.self_employed,
            status="PENDING"  # Initial status
        )
        db.add(new_application)
        db.commit()
        db.refresh(new_application)
        
        return {
            "message": "Application submitted successfully",
            "application_id": new_application.id,
            "cibil_score": cibil_score  # Return fetched score
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting application: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@router.post("/process/{application_id}", response_model=dict)
async def process_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    """Process loan application through ML pipeline - provides recommendation only"""
    
    try:
        application = db.query(LoanApplication).filter(
            LoanApplication.id == application_id
        ).first()
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        pipeline = _run_processing_pipeline(application, db)
        return {
            "application_id": application.id,
            "status": "UNDER_REVIEW",
            "ml_recommendation": pipeline["risk_result"]['final_decision'],
            "loan_prediction": pipeline["loan_result"],
            "fraud_detection": pipeline["fraud_result"],
            "combined_risk": pipeline["risk_result"],
            "note": "This is an AI recommendation. Final decision pending admin review."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error in process_application: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


def _build_app_data(application: LoanApplication) -> dict:
    return {
        'no_of_dependents': application.no_of_dependents,
        'income_annum': application.income_annum,
        'loan_amount': application.loan_amount,
        'loan_term': application.loan_term,
        'cibil_score': application.cibil_score,
        'residential_assets_value': application.residential_assets_value,
        'commercial_assets_value': application.commercial_assets_value,
        'luxury_assets_value': application.luxury_assets_value,
        'bank_asset_value': application.bank_asset_value,
        'education': application.education,
        'self_employed': application.self_employed,
        'user_full_name': application.user.full_name if application.user else None,
        'user_email': application.user.email if application.user else None
    }


def _run_processing_pipeline(application: LoanApplication, db: Session) -> dict:
    """
    Runs ML + fraud + combined risk, then persists results on the application and fraud_checks.
    Safe to call multiple times (overwrites previous fraud check snapshot).
    """
    app_data = _build_app_data(application)
    print(f"Processing application {application.id} with data: {app_data}")

    loan_result = ml_service.predict_loan_approval(app_data)
    print(f"✅ Loan prediction result: {loan_result}")

    documents = db.query(Document).filter(Document.application_id == application.id).all()
    fraud_result = fraud_service.detect_fraud(app_data, documents)
    print(f"✅ Fraud detection result: {fraud_result}")

    # Penalize AI Approval Score based on Fraud Score
    original_prob = loan_result['approval_probability']
    fraud_penalty = fraud_result['fraud_score']
    adjusted_prob = max(0.0, original_prob * (1 - fraud_penalty))
    loan_result['approval_probability'] = adjusted_prob

    risk_result = risk_service.calculate_combined_risk(
        loan_result['approval_probability'],
        fraud_result['fraud_score']
    )
    print(f"✅ Risk assessment result: {risk_result}")

    ai_reasoning = _generate_ai_reasoning(
        loan_result,
        fraud_result,
        risk_result,
        app_data
    )

    application.approval_probability = loan_result['approval_probability']
    application.fraud_score = fraud_result['fraud_score']
    application.final_decision = risk_result['final_decision']
    application.ai_reasoning = ai_reasoning
    application.status = "UNDER_REVIEW"

    existing_fraud_check = db.query(FraudCheck).filter(FraudCheck.application_id == application.id).first()
    if existing_fraud_check:
        existing_fraud_check.fraud_score = fraud_result['fraud_score']
        existing_fraud_check.is_fraudulent = fraud_result['is_fraudulent']
        existing_fraud_check.anomaly_detected = fraud_result['anomaly_detected']
        existing_fraud_check.fraud_flags = fraud_result['fraud_flags']
    else:
        db.add(FraudCheck(
            application_id=application.id,
            fraud_score=fraud_result['fraud_score'],
            is_fraudulent=fraud_result['is_fraudulent'],
            anomaly_detected=fraud_result['anomaly_detected'],
            fraud_flags=fraud_result['fraud_flags']
        ))

    db.commit()
    print(f"✅ Application {application.id} processed successfully - Status: UNDER_REVIEW")

    return {
        "app_data": app_data,
        "loan_result": loan_result,
        "fraud_result": fraud_result,
        "risk_result": risk_result,
        "ai_reasoning": ai_reasoning
    }

@router.post("/documents/{application_id}")
async def upload_documents(
    application_id: int,
    identityProof: UploadFile = File(...),
    addressProof: UploadFile = File(...),
    incomeProof: UploadFile = File(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload application documents"""
    
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id,
        LoanApplication.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Create application-specific directory
    app_dir = os.path.join(UPLOAD_DIR, f"app_{application_id}")
    os.makedirs(app_dir, exist_ok=True)
    
    documents_to_upload = {
        'identity_proof': identityProof,
        'address_proof': addressProof,
        'income_proof': incomeProof,
        'photo': photo
    }
    
    uploaded_docs = []
    
    try:
        for doc_type, file in documents_to_upload.items():
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_extension = os.path.splitext(file.filename)[1]
            new_filename = f"{doc_type}_{timestamp}{file_extension}"
            file_path = os.path.abspath(os.path.join(app_dir, new_filename))
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Extract OCR text for supported types (images & PDFs)
            ocr_text = None
            if file_extension.lower() in [".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".pdf"]:
                ocr_text = ocr_service.extract_text(file_path)
            
            # Create document record
            document = Document(
                application_id=application_id,
                document_type=doc_type,
                file_name=file.filename,
                file_path=file_path,
                ocr_extracted_text=ocr_text
            )
            db.add(document)
            uploaded_docs.append({
                'type': doc_type,
                'filename': file.filename,
                'path': file_path
            })

        db.commit()

        # Re-run processing after document upload so fraud flags are not stuck as MISSING_*
        # if the user previously hit "/process" before uploading docs.
        try:
            db.refresh(application)
            _run_processing_pipeline(application, db)
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Error re-processing after document upload: {str(e)}")
            print(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Documents uploaded, but processing failed: {str(e)}")
        
        return {
            "message": "Documents uploaded successfully",
            "documents": uploaded_docs
        }
        
    except Exception as e:
        print(f"Error uploading documents: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to upload documents: {str(e)}")

@router.get("/documents/{application_id}")
async def get_application_documents(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all documents for an application"""
    
    # Check if user owns the application or is admin
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Allow if user owns application OR user is admin
    if application.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    documents = db.query(Document).filter(
        Document.application_id == application_id
    ).all()
    
    print(f"📄 Found {len(documents)} documents for application {application_id}")
    
    # Convert to response format
    docs_response = []
    for doc in documents:
        # Create proper URL for frontend access
        file_url = f'http://localhost:8000/uploads/documents/app_{application_id}/{os.path.basename(doc.file_path)}'
        
        # Debug: Check if file exists
        if os.path.exists(doc.file_path):
            print(f"✅ File exists: {doc.file_path}")
        else:
            print(f"❌ File NOT found: {doc.file_path}")
        
        docs_response.append({
            'id': doc.id,
            'name': doc.file_name,
            'type': doc.document_type,
            'url': file_url,
            'uploaded_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None
        })
    
    return docs_response

# ============ ADMIN-ONLY ENDPOINTS ============

@router.get("/admin/all-applications", response_model=List[LoanApplicationResponse])
async def get_all_applications(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)  # ← ADMIN PROTECTION
):
    """Admin: Get all applications from all users"""
    
    print(f"✅ Admin {admin_user.email} accessing all applications")
    
    # Eagerly load user relationship
    from sqlalchemy.orm import joinedload
    applications = db.query(LoanApplication).options(joinedload(LoanApplication.user)).all()
    
    return applications

def _generate_ai_reasoning(loan_result: dict, fraud_result: dict, risk_result: dict, app_data: dict) -> str:
    """Generate human-readable AI reasoning for admin review"""
    
    decision = risk_result['final_decision']
    approval_prob = loan_result['approval_probability']
    fraud_score = fraud_result['fraud_score']
    cibil_score = app_data.get('cibil_score', 0)
    income = app_data.get('income_annum', 0)
    loan_amount = app_data.get('loan_amount', 0)
    loan_to_income = loan_amount / income if income > 0 else 0
    
    reasons = []
    
    if decision == "APPROVED":
        reasons.append(f"✅ RECOMMENDATION: APPROVE")
        reasons.append(f"\n📊 Key Factors Supporting Approval:")
        
        if approval_prob >= 0.80:
            reasons.append(f"• High approval probability ({approval_prob*100:.1f}%) indicates strong creditworthiness")
        elif approval_prob >= 0.65:
            reasons.append(f"• Moderate approval probability ({approval_prob*100:.1f}%) suggests acceptable risk")
        
        if cibil_score >= 750:
            reasons.append(f"• Excellent CIBIL score ({cibil_score}) demonstrates strong credit history")
        elif cibil_score >= 700:
            reasons.append(f"• Good CIBIL score ({cibil_score}) indicates reliable payment behavior")
        elif cibil_score >= 650:
            reasons.append(f"• Fair CIBIL score ({cibil_score}) is within acceptable range")
        
        if loan_to_income <= 3:
            reasons.append(f"• Reasonable loan-to-income ratio ({loan_to_income:.2f}x) shows manageable debt burden")
        elif loan_to_income <= 5:
            reasons.append(f"• Moderate loan-to-income ratio ({loan_to_income:.2f}x) is acceptable")
        
        if fraud_score < 0.3:
            reasons.append(f"• Low fraud risk ({fraud_score*100:.1f}%) - no suspicious patterns detected")
        elif fraud_score < 0.5:
            reasons.append(f"• Moderate fraud risk ({fraud_score*100:.1f}%) - standard verification recommended")
        
        # Add top factors from explanation
        if 'explanation' in loan_result and 'top_factors' in loan_result['explanation']:
            top_factors = loan_result['explanation']['top_factors'][:3]
            if top_factors:
                reasons.append(f"\n🎯 Top Contributing Factors:")
                for factor in top_factors:
                    reasons.append(f"• {factor['feature']}: {factor['impact']} impact (value: {factor['value']})")
    
    elif decision == "REJECTED":
        reasons.append(f"❌ RECOMMENDATION: REJECT")
        reasons.append(f"\n⚠️ Key Concerns Identified:")
        
        if approval_prob < 0.50:
            reasons.append(f"• Low approval probability ({approval_prob*100:.1f}%) indicates high credit risk")
        
        if cibil_score < 650:
            reasons.append(f"• Low CIBIL score ({cibil_score}) suggests poor credit history or payment issues")
        
        if loan_to_income > 5:
            reasons.append(f"• High loan-to-income ratio ({loan_to_income:.2f}x) indicates excessive debt burden")
        
        if fraud_score >= 0.5:
            reasons.append(f"• Elevated fraud risk ({fraud_score*100:.1f}%) - suspicious patterns detected")
            if 'fraud_flags' in fraud_result and fraud_result['fraud_flags']:
                reasons.append(f"• Fraud indicators: {', '.join(fraud_result['fraud_flags'])}")
        
        # Add top negative factors
        if 'explanation' in loan_result and 'top_factors' in loan_result['explanation']:
            negative_factors = [f for f in loan_result['explanation']['top_factors'] 
                              if f['impact'] in ['Negative', 'Neutral']]
            if negative_factors:
                reasons.append(f"\n🔴 Risk Factors:")
                for factor in negative_factors[:3]:
                    reasons.append(f"• {factor['feature']}: {factor['impact']} (value: {factor['value']})")
    
    else:  # MANUAL_REVIEW
        reasons.append(f"⚠️ RECOMMENDATION: MANUAL REVIEW REQUIRED")
        reasons.append(f"\n📋 Mixed Signals Detected:")
        reasons.append(f"• Approval probability: {approval_prob*100:.1f}% (borderline)")
        reasons.append(f"• Fraud risk: {fraud_score*100:.1f}%")
        reasons.append(f"• CIBIL score: {cibil_score}")
        reasons.append(f"\n💡 Recommendation: Review documents carefully and consider additional verification")
    
    return "\n".join(reasons)

@router.post("/review/{application_id}", response_model=dict)
async def review_application(
    application_id: int,
    decision: str = Form(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)  # ← ADMIN PROTECTION
):
    """Admin: Approve or reject an application after review"""
    
    if decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Decision must be 'APPROVED' or 'REJECTED'")
    
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update status to final decision
    application.status = decision
    application.final_decision = decision
    
    db.commit()
    
    print(f"✅ Admin {admin_user.email} {decision} application #{application_id}")
    
    # Trigger WebSocket Broadcast
    try:
        await manager.send_personal_message(
            {
                "type": "APPLICATION_UPDATE", 
                "application_id": application_id, 
                "status": decision,
                "message": f"Your application has been {decision.lower()}."
            },
            application.user_id
        )
    except Exception as e:
        print(f"WS error: {e}")
    
    return {
        "message": f"Application {decision.lower()} successfully",
        "application_id": application.id,
        "status": decision,
        "reviewed_by": admin_user.email
    }

@router.post("/admin/retrain", response_model=dict)
async def trigger_model_retraining(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Admin: Retrain the ML model using historical decisions"""
    from app.services.ml_service import ml_service
    
    # Fetch all resolved applications
    applications = db.query(LoanApplication).filter(
        LoanApplication.final_decision.in_(["APPROVED", "REJECTED"])
    ).all()
    
    if len(applications) < 10:
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough historical data to retrain (found {len(applications)}, minimum 10 needed)"
        )
        
    app_data_list = []
    for app in applications:
        app_data = _build_app_data(app)
        app_data['target'] = 1 if app.final_decision == "APPROVED" else 0
        app_data_list.append(app_data)
        
    result = ml_service.retrain_model(app_data_list)
    return result

# ============ USER ENDPOINTS ============

@router.get("/status/{application_id}", response_model=LoanApplicationResponse)
async def get_application_status(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get application status"""
    
    # Eagerly load user relationship
    from sqlalchemy.orm import joinedload
    
    # Allow user to see their own OR admin to see any
    if current_user.is_admin:
        application = db.query(LoanApplication).options(
            joinedload(LoanApplication.user)
        ).filter(LoanApplication.id == application_id).first()
    else:
        application = db.query(LoanApplication).options(
            joinedload(LoanApplication.user)
        ).filter(
            LoanApplication.id == application_id,
            LoanApplication.user_id == current_user.id
        ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return application

@router.get("/my-applications", response_model=List[LoanApplicationResponse])
async def get_user_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all applications for current user"""
    applications = db.query(LoanApplication).filter(
        LoanApplication.user_id == current_user.id
    ).all()
    
    return applications