import joblib
import numpy as np
import pandas as pd
from typing import Dict
import os
import random

class MLService:
    def __init__(self):
        """Load trained Random Forest model and StandardScaler"""
        model_dir = "app/ml_models"
        
        try:
            self.loan_model = joblib.load(os.path.join(model_dir, "loan_model.pkl"))
            print("✅ Random Forest model loaded successfully")
        except Exception as e:
            print(f"⚠️ Warning: Could not load model: {e}")
            self.loan_model = None
        
        try:
            self.scaler = joblib.load(os.path.join(model_dir, "scaler.pkl"))
            print("✅ StandardScaler loaded successfully")
        except Exception as e:
            print(f"⚠️ Warning: Could not load scaler: {e}")
            self.scaler = None
        
        self.feature_names = [
            'no_of_dependents',
            'income_annum',
            'loan_amount',
            'loan_term',
            'cibil_score',
            'residential_assets_value',
            'commercial_assets_value',
            'luxury_assets_value',
            'bank_asset_value',
            'education',
            'self_employed'
        ]
    
    def apply_business_rules(self, application_data: Dict, ml_probability: float) -> Dict:
        """
        Apply business rules to adjust ML predictions
        This ensures sensible decisions for obvious cases
        """
        cibil_score = application_data.get('cibil_score', 0)
        income = application_data.get('income_annum', 0)
        loan_amount = application_data.get('loan_amount', 0)
        loan_term = application_data.get('loan_term', 1)
        
        # Calculate key ratios
        loan_to_income_ratio = loan_amount / income if income > 0 else 999
        monthly_income = income / 12
        monthly_payment = loan_amount / (loan_term * 12) if loan_term > 0 else 999
        payment_to_income_ratio = monthly_payment / monthly_income if monthly_income > 0 else 999
        
        print(f"\n💼 BUSINESS RULES ANALYSIS:")
        print(f"   Loan-to-Income Ratio: {loan_to_income_ratio:.2f}x")
        print(f"   Payment-to-Income Ratio: {payment_to_income_ratio*100:.2f}%")
        print(f"   CIBIL Score: {cibil_score}")
        
        adjusted_probability = ml_probability
        adjustments = []
        
        # Add small random variation to base probability (±1%)
        random_base_variation = random.uniform(-0.01, 0.01)
        adjusted_probability += random_base_variation
        
        # Rule 1: Excellent CIBIL + Reasonable Loan
        if cibil_score >= 750 and loan_to_income_ratio <= 3:
            boost = 0.20 + random.uniform(-0.02, 0.02)  # 18-22% boost
            adjusted_probability = min(ml_probability + boost, 0.95)
            adjustments.append(f"Excellent credit (CIBIL {cibil_score}) + Reasonable loan ratio: +{boost*100:.2f}%")
        
        # Rule 2: Good CIBIL + Low Loan Amount
        elif cibil_score >= 700 and loan_to_income_ratio <= 2:
            boost = 0.15 + random.uniform(-0.015, 0.015)  # 13.5-16.5% boost
            adjusted_probability = min(ml_probability + boost, 0.90)
            adjustments.append(f"Good credit + Low loan ratio: +{boost*100:.2f}%")
        
        # Rule 3: Payment-to-Income is very manageable
        if payment_to_income_ratio <= 0.3 and cibil_score >= 650:
            boost = 0.10 + random.uniform(-0.01, 0.01)  # 9-11% boost
            adjusted_probability = min(adjusted_probability + boost, 0.92)
            adjustments.append(f"Manageable monthly payment: +{boost*100:.2f}%")
        
        # Rule 4: Very high CIBIL should almost always approve if loan is reasonable
        if cibil_score >= 800 and loan_to_income_ratio <= 5:
            # Add small random variation (±2%)
            random_adjustment = random.uniform(-0.02, 0.02)
            adjusted_probability = max(adjusted_probability, 0.85 + random_adjustment)
            adjustments.append(f"Exceptional CIBIL {cibil_score}: Minimum {(0.85 + random_adjustment)*100:.2f}% approval")
        
        # Rule 5: Red flags that reduce probability
        if payment_to_income_ratio > 0.5:
            penalty = 0.15 + random.uniform(-0.01, 0.01)  # 14-16% penalty
            adjusted_probability = max(adjusted_probability - penalty, 0.1)
            adjustments.append(f"High payment burden: -{penalty*100:.2f}%")
        
        if adjustments:
            print(f"\n📊 APPLIED ADJUSTMENTS:")
            for adj in adjustments:
                print(f"   ✓ {adj}")
            print(f"   ML Probability: {ml_probability*100:.2f}% → Adjusted: {adjusted_probability*100:.2f}%")
        else:
            print(f"   ℹ️ No business rule adjustments applied")
        
        return {
            "adjusted_probability": adjusted_probability,
            "ml_probability": ml_probability,
            "adjustments": adjustments,
            "ratios": {
                "loan_to_income": loan_to_income_ratio,
                "payment_to_income": payment_to_income_ratio
            }
        }
    
    def preprocess_features(self, data: Dict) -> pd.DataFrame:
        """Convert application data to model input features"""
        education_encoded = 1 if data['education'] == 'Graduate' else 0
        self_employed_encoded = 1 if data['self_employed'] else 0
        
        if hasattr(self.scaler, 'feature_names_in_'):
            feature_names = self.scaler.feature_names_in_.tolist()
        else:
            feature_names = self.feature_names
        
        feature_dict = {}
        for fname in feature_names:
            if fname == 'education':
                feature_dict[fname] = [education_encoded]
            elif fname == 'self_employed':
                feature_dict[fname] = [self_employed_encoded]
            else:
                feature_dict[fname] = [data.get(fname, 0)]
        
        features_df = pd.DataFrame(feature_dict)
        
        if self.scaler is not None:
            scaled_array = self.scaler.transform(features_df)
            features_df = pd.DataFrame(scaled_array, columns=features_df.columns)
        
        return features_df
    
    def predict_loan_approval(self, application_data: Dict) -> Dict:
        """Predict loan approval using ML model + Business Rules"""
        print("\n" + "="*80)
        print("🔍 HYBRID PREDICTION: ML Model + Business Rules")
        print(f"📥 Input: Income={application_data['income_annum']}, Loan={application_data['loan_amount']}, CIBIL={application_data['cibil_score']}")
        print("="*80)
        
        if self.loan_model is None:
            print("⚠️ Model not loaded - using rule-based prediction")
            return self._rule_based_prediction(application_data)
        
        try:
            # Step 1: Get ML prediction
            features_df = self.preprocess_features(application_data)
            ml_probability = self.loan_model.predict_proba(features_df)[0]
            ml_approval_prob = float(ml_probability[1])
            
            print(f"\n🤖 ML MODEL PREDICTION:")
            print(f"   Raw ML Approval Probability: {ml_approval_prob*100:.2f}%")
            
            # Step 2: Apply business rules
            business_result = self.apply_business_rules(application_data, ml_approval_prob)
            final_probability = business_result['adjusted_probability']
            
            # Step 3: Make final decision
            decision = "APPROVED" if final_probability >= 0.60 else "REJECTED"
            
            # Ensure probability stays within bounds [0, 1]
            final_probability = max(0.0, min(1.0, final_probability))
            
            print(f"\n✅ FINAL DECISION:")
            print(f"   Final Approval Probability: {final_probability*100:.2f}%")
            print(f"   Decision: {decision}")
            
            # Feature importance
            feature_importances = self.loan_model.feature_importances_
            explanation = self._generate_explanation(
                feature_importances,
                application_data,
                features_df.columns.tolist()
            )
            
            # Add business rule info to explanation
            if business_result['adjustments']:
                explanation['business_rules'] = business_result['adjustments']
                explanation['ratios'] = business_result['ratios']
            
            # Risk level based on final probability
            if final_probability >= 0.85:
                risk_level = "LOW"
            elif final_probability >= 0.65:
                risk_level = "MEDIUM"
            else:
                risk_level = "HIGH"
            
            result = {
                "approval_probability": float(final_probability),
                "decision": decision,
                "explanation": explanation,
                "risk_level": risk_level,
                "ml_probability": ml_approval_prob,  # Keep original ML prediction for transparency
            }
            
            print(f"\n📤 Result: {result}")
            print("="*80 + "\n")
            
            return result
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return self._rule_based_prediction(application_data)
    
    def _generate_explanation(self, importances, raw_data: Dict, feature_names: list) -> Dict:
        """Generate explanation based on feature importance"""
        importance_pairs = list(zip(feature_names, importances))
        importance_pairs.sort(key=lambda x: x[1], reverse=True)
        top_features = importance_pairs[:5]
        
        explanation_factors = []
        
        for feature_name, importance in top_features:
            if feature_name == 'education':
                value = "Graduate" if raw_data['education'] == 'Graduate' else "Not Graduate"
                impact = "Positive" if raw_data['education'] == 'Graduate' else "Neutral"
            elif feature_name == 'self_employed':
                value = "Yes" if raw_data['self_employed'] else "No"
                impact = "Neutral"
            elif feature_name == 'cibil_score':
                value = raw_data[feature_name]
                if value >= 750:
                    impact = "Very Positive"
                elif value >= 650:
                    impact = "Positive"
                else:
                    impact = "Negative"
            else:
                value = raw_data.get(feature_name, 0)
                impact = "Positive"
            
            explanation_factors.append({
                "feature": feature_name.replace('_', ' ').title(),
                "impact": impact,
                "value": value,
                "importance": float(importance)
            })
        
        return {"top_factors": explanation_factors}
    
    def _rule_based_prediction(self, application_data: Dict) -> Dict:
        """Pure rule-based prediction when ML model unavailable"""
        cibil_score = application_data.get('cibil_score', 0)
        income = application_data.get('income_annum', 0)
        loan_amount = application_data.get('loan_amount', 0)
        
        loan_to_income = loan_amount / income if income > 0 else 999
        
        if cibil_score >= 750 and loan_to_income <= 3:
            probability = 0.90
        elif cibil_score >= 700 and loan_to_income <= 4:
            probability = 0.75
        elif cibil_score >= 650 and loan_to_income <= 5:
            probability = 0.60
        else:
            probability = 0.35
        
        decision = "APPROVED" if probability >= 0.60 else "REJECTED"
        
        return {
            "approval_probability": float(probability),
            "decision": decision,
            "explanation": {
                "top_factors": [
                    {"feature": "CIBIL Score", "impact": "High", "value": cibil_score},
                    {"feature": "Loan to Income Ratio", "impact": "Medium", "value": f"{loan_to_income:.2f}x"}
                ]
            },
            "risk_level": "LOW" if probability >= 0.85 else "MEDIUM" if probability >= 0.65 else "HIGH"
        }

# Create singleton instance
ml_service = MLService()