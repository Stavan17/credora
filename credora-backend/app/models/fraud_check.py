from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class FraudCheck(Base):
    __tablename__ = "fraud_checks"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("loan_applications.id"), unique=True)
    
    fraud_score = Column(Float, nullable=False)
    is_fraudulent = Column(Boolean, nullable=False)
    anomaly_detected = Column(Boolean, default=False)
    fraud_flags = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    application = relationship("LoanApplication", back_populates="fraud_check")