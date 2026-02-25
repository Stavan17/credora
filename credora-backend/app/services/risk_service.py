from typing import Dict

class RiskService:
    def calculate_combined_risk(self, loan_score: float, fraud_score: float) -> Dict:
        """2D Risk Matrix"""
        
        if fraud_score > 0.7:
            decision = "REJECTED"
            recommendation = "High fraud risk detected. Reject application."
        elif fraud_score > 0.4:
            if loan_score > 0.7:
                decision = "MANUAL_REVIEW"
                recommendation = "Medium fraud risk with good credit. Manual review required."
            else:
                decision = "REJECTED"
                recommendation = "Medium fraud risk with poor credit. Reject."
        else:
            if loan_score > 0.6:
                decision = "APPROVED"
                recommendation = "Low fraud risk and good creditworthiness. Approve."
            elif loan_score > 0.4:
                decision = "MANUAL_REVIEW"
                recommendation = "Low fraud risk but borderline credit. Review required."
            else:
                decision = "REJECTED"
                recommendation = "Low fraud risk but poor creditworthiness. Reject."
        
        risk_matrix = {
            "x": float(loan_score),
            "y": float(fraud_score),
            "quadrant": self._get_quadrant(loan_score, fraud_score)
        }
        
        return {
            "loan_score": loan_score,
            "fraud_score": fraud_score,
            "final_decision": decision,
            "risk_matrix_position": risk_matrix,
            "recommendation": recommendation
        }
    
    def _get_quadrant(self, loan_score: float, fraud_score: float) -> str:
        if loan_score >= 0.5 and fraud_score < 0.5:
            return "LOW_RISK"
        elif loan_score >= 0.5 and fraud_score >= 0.5:
            return "MEDIUM_RISK"
        elif loan_score < 0.5 and fraud_score < 0.5:
            return "MEDIUM_RISK"
        else:
            return "HIGH_RISK"

risk_service = RiskService()