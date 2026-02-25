from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LoanApplicationCreate(BaseModel):
    # Personal Information
    no_of_dependents: int = Field(..., ge=0, le=5, description="Number of dependents (0-5)")
    education: str = Field(..., description="Graduate or Not Graduate")
    self_employed: bool = Field(default=False, description="Self-employed status")
    
    # Financial Information
    income_annum: float = Field(..., gt=0, description="Annual income")
    loan_amount: float = Field(..., gt=0, description="Loan amount requested")
    loan_term: int = Field(..., gt=0, description="Loan term in years")
    cibil_score: Optional[int] = Field(None, ge=300, le=900, description="Credit score (300-900) - auto-fetched if not provided")
    
    # Asset Values
    residential_assets_value: float = Field(default=0, ge=0, description="Residential property value")
    commercial_assets_value: float = Field(default=0, ge=0, description="Commercial property value")
    luxury_assets_value: float = Field(default=0, ge=0, description="Luxury assets value")
    bank_asset_value: float = Field(default=0, ge=0, description="Bank assets/savings value")

# User data to include in application response
class UserInResponse(BaseModel):
    id: int
    email: str
    full_name: str
    
    class Config:
        from_attributes = True

class LoanApplicationResponse(BaseModel):
    id: int
    user_id: int
    
    # Application data
    no_of_dependents: int
    income_annum: float
    loan_amount: float
    loan_term: int
    cibil_score: int
    residential_assets_value: float
    commercial_assets_value: float
    luxury_assets_value: float
    bank_asset_value: float
    education: str
    self_employed: bool
    
    # Results
    approval_probability: Optional[float] = None
    fraud_score: Optional[float] = None
    final_decision: Optional[str] = None
    ai_reasoning: Optional[str] = None  # Admin-only AI explanation
    status: str
    created_at: datetime
    
    # Include user details (for admin viewing)
    user: Optional[UserInResponse] = None
    
    class Config:
        from_attributes = True

class LoanPredictionResult(BaseModel):
    approval_probability: float
    decision: str
    explanation: dict
    risk_level: str