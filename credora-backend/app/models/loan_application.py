from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Required fields for your model
    no_of_dependents = Column(Integer, nullable=False, default=0)
    income_annum = Column(Float, nullable=False)  # Annual income
    loan_amount = Column(Float, nullable=False)
    loan_term = Column(Integer, nullable=False)  # In years
    cibil_score = Column(Integer, nullable=False)  # Credit score
    
    # Asset values (new fields)
    residential_assets_value = Column(Float, default=0)
    commercial_assets_value = Column(Float, default=0)
    luxury_assets_value = Column(Float, default=0)
    bank_asset_value = Column(Float, default=0)
    
    # Categorical fields
    education = Column(String, nullable=False)  # Graduate/Not Graduate
    self_employed = Column(Boolean, default=False)
    
    # Results
    approval_probability = Column(Float, nullable=True)
    fraud_score = Column(Float, nullable=True)
    final_decision = Column(String, nullable=True)
    ai_reasoning = Column(String, nullable=True)  # AI explanation for admin only
    status = Column(String, default="PENDING")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="applications")
    documents = relationship("Document", back_populates="application")
    fraud_check = relationship("FraudCheck", back_populates="application", uselist=False)