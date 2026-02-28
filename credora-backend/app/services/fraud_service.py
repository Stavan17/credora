import os
import re
from typing import Dict, List

from app.services.document_quality_service import check_photo_quality


class FraudService:
    def __init__(self):
        pass
    
    def check_rule_based_fraud(self, application_data: Dict, documents: List) -> List[str]:
        """Rule-based fraud checks"""
        flags = []
        
        # Check if loan amount is excessive compared to income
        income = application_data.get('income_annum', 0)
        loan_amount = application_data.get('loan_amount', 0)
        
        if income > 0 and loan_amount > income * 10:
            flags.append("EXCESSIVE_LOAN_AMOUNT")
        
        # Check if CIBIL score is low but loan amount is high
        cibil_score = application_data.get('cibil_score', 0)
        if cibil_score < 550 and loan_amount > 500000:
            flags.append("LOW_CREDIT_HIGH_LOAN")
        
        # Check for unrealistic income
        if income > 50000000:  # 5 crore per year
            flags.append("UNREALISTIC_INCOME")
        
        # Check loan term vs loan amount ratio
        loan_term = application_data.get('loan_term', 1)
        if loan_term > 0:
            monthly_payment = loan_amount / (loan_term * 12)
            monthly_income = income / 12
            if monthly_income > 0 and monthly_payment > monthly_income * 0.7:
                flags.append("HIGH_PAYMENT_TO_INCOME")

        # ------- Document & OCR-based rules -------
        required_types = ["identity_proof", "address_proof", "income_proof", "photo"]
        if documents:
            doc_text_by_type = {}
            for doc in documents:
                text = getattr(doc, "ocr_extracted_text", None) or ""
                doc_text_by_type[doc.document_type] = text.lower()

            # Quick checks: missing or very weak OCR text
            for doc_type in required_types:
                if doc_type not in doc_text_by_type:
                    flags.append(f"MISSING_{doc_type.upper()}")
                else:
                    if len(doc_text_by_type[doc_type]) < 40:
                        flags.append(f"DOC_OCR_WEAK_{doc_type.upper()}")

            # Identity proof name mismatch
            full_name = (application_data.get("user_full_name") or "").lower()
            identity_text = doc_text_by_type.get("identity_proof", "")
            if full_name and identity_text:
                name_parts = [p for p in full_name.split() if len(p) > 2]
                if name_parts and not all(part in identity_text for part in name_parts):
                    flags.append("IDENTITY_NAME_MISMATCH")

            # Keyword expectations per document type
            expected_keywords = {
                "identity_proof": ["aadhar", "aadhaar", "passport", "license", "licence", "pan", "govt of india", "government of india"],
                "address_proof": ["address", "pin code", "pincode", "road", "street", "city", "state"],
                "income_proof": ["salary", "income", "ctc", "gross", "net pay", "payslip", "pay slip", "annual income", "form 16", "itr"],
            }
            marksheet_keywords = ["marksheet", "mark sheet", "semester", "university", "examination", "exam", "cgpa", "sgpa"]

            for doc_type, text in doc_text_by_type.items():
                if doc_type in expected_keywords:
                    has_expected = any(k in text for k in expected_keywords[doc_type])
                    has_marksheet = any(k in text for k in marksheet_keywords)
                    if not has_expected and has_marksheet:
                        flags.append(f"POSSIBLE_MARKSHEET_IN_{doc_type.upper()}")
                    elif not has_expected:
                        flags.append(f"UNEXPECTED_CONTENT_IN_{doc_type.upper()}")

            # Same document reused for multiple proofs (very similar OCR text)
            types = list(doc_text_by_type.keys())
            for i in range(len(types)):
                for j in range(i + 1, len(types)):
                    t1, t2 = types[i], types[j]
                    text1, text2 = doc_text_by_type[t1], doc_text_by_type[t2]
                    if not text1 or not text2:
                        continue
                    words1 = set(text1.split())
                    words2 = set(text2.split())
                    if len(words1) < 20 or len(words2) < 20:
                        continue
                    overlap = len(words1 & words2) / max(len(words1), len(words2))
                    if overlap > 0.8:
                        flags.append("SAME_DOCUMENT_USED_FOR_MULTIPLE_PROOFS")
                        break
                else:
                    continue
                break

            # Income proof vs declared income
            income_text = ""
            for key in ["income_proof", "salary_slip", "bank_statement"]:
                if key in doc_text_by_type:
                    income_text += " " + doc_text_by_type[key]

            if income_text and income > 0:
                raw_numbers = re.findall(r"\d[\d,]{4,}", income_text)
                parsed_numbers = []
                for n in raw_numbers:
                    try:
                        parsed_numbers.append(float(n.replace(",", "")))
                    except ValueError:
                        continue

                if parsed_numbers:
                    inferred_income = max(parsed_numbers)
                    ratio = inferred_income / income if income else 0
                    if ratio > 1.5:
                        flags.append("INCOME_DOC_HIGHER_THAN_DECLARED")
                    elif ratio < 0.5:
                        flags.append("INCOME_DOC_LOWER_THAN_DECLARED")

            # -------- Photo quality: face detection and brightness --------
            for doc in documents:
                if getattr(doc, "document_type", None) != "photo":
                    continue
                file_path = getattr(doc, "file_path", None)
                if not file_path:
                    continue
                # Resolve relative paths (e.g. from older uploads) against cwd
                if not os.path.isabs(file_path) and not os.path.isfile(file_path):
                    file_path = os.path.join(os.getcwd(), file_path)
                photo_flags = check_photo_quality(file_path)
                flags.extend(photo_flags)
        else:
            # No documents uploaded yet (e.g. process ran before uploads)
            for doc_type in required_types:
                flags.append(f"MISSING_{doc_type.upper()}")

        return flags
    
    def detect_fraud(self, application_data: Dict, documents: List) -> Dict:
        """Main fraud detection function"""
        
        fraud_flags = self.check_rule_based_fraud(application_data, documents)
        
        # Flags that indicate strong document/identity risk (higher weight)
        severe_flags = {
            "NO_FACE_DETECTED_IN_PHOTO",
            "PHOTO_OR_IMAGE_TOO_DARK",
            "UNEXPECTED_CONTENT_IN_IDENTITY_PROOF",
            "UNEXPECTED_CONTENT_IN_ADDRESS_PROOF",
            "UNEXPECTED_CONTENT_IN_INCOME_PROOF",
            "POSSIBLE_MARKSHEET_IN_IDENTITY_PROOF",
            "POSSIBLE_MARKSHEET_IN_ADDRESS_PROOF",
            "POSSIBLE_MARKSHEET_IN_INCOME_PROOF",
            "SAME_DOCUMENT_USED_FOR_MULTIPLE_PROOFS",
            "IDENTITY_NAME_MISMATCH",
        }
        
        # Calculate base fraud score (deterministic, primarily driven by flags and CIBIL)
        base_score = 0.1
        for flag in fraud_flags:
            base_score += 0.18 if flag in severe_flags else 0.12
        
        # Adjust based on CIBIL score (lower score = higher fraud risk)
        cibil_score = application_data.get('cibil_score', 300)
        if cibil_score < 500:
            base_score += 0.2
        elif cibil_score < 600:
            base_score += 0.1
        
        # Cap at 1.0
        fraud_score = min(base_score, 1.0)
        is_fraudulent = fraud_score > 0.6 or len(fraud_flags) >= 2
        
        # Determine risk level
        if fraud_score > 0.7:
            risk_level = "HIGH"
        elif fraud_score > 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return {
            "fraud_score": float(fraud_score),
            "is_fraudulent": is_fraudulent,
            "anomaly_detected": fraud_score > 0.5,
            "fraud_flags": fraud_flags,
            "risk_level": risk_level
        }

fraud_service = FraudService()