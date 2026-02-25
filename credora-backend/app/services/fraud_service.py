import random
from typing import Dict, List

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
        
        return flags
    
    def detect_fraud(self, application_data: Dict, documents: List) -> Dict:
        """Main fraud detection function"""
        
        fraud_flags = self.check_rule_based_fraud(application_data, documents)
        
        # Calculate base fraud score
        base_score = random.uniform(0.1, 0.3)
        
        # Adjust based on flags
        if len(fraud_flags) > 0:
            base_score += len(fraud_flags) * 0.15
        
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