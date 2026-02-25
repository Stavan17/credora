"""
CIBIL Score Service
Simulates a CIBIL database lookup similar to bank software
Uses email as the primary identifier to fetch credit score
"""

from typing import Optional, Dict
import random

class CIBILService:
    """
    Dummy CIBIL database service
    In production, this would connect to actual CIBIL API/database
    """
    
    def __init__(self):
        # Dummy CIBIL database - maps email to credit score
        # In production, this would be a real database or API call
        self.cibil_database = {
            # Admin user - high score
            "admin@credora.com": 820,
            
            # Sample users with various scores
            "john.doe@example.com": 750,
            "jane.smith@example.com": 680,
            "test@example.com": 720,
            "demo@example.com": 650,
            
            # Add more entries as needed
        }
    
    def get_cibil_score(self, email: str, full_name: Optional[str] = None) -> Dict:
        """
        Fetch CIBIL score for a user based on email
        
        Args:
            email: User's email address (primary identifier)
            full_name: Optional full name for additional verification
            
        Returns:
            Dict with cibil_score and metadata
        """
        # Check if user exists in database
        if email.lower() in self.cibil_database:
            score = self.cibil_database[email.lower()]
            return {
                "cibil_score": score,
                "source": "CIBIL_DATABASE",
                "status": "VERIFIED",
                "last_updated": "2024-01-01"  # Dummy date
            }
        
        # If not found, generate a realistic score based on email hash
        # This simulates a new user lookup
        # In production, this would make an actual API call to CIBIL
        score = self._generate_realistic_score(email)
        
        # Store in database for future lookups
        self.cibil_database[email.lower()] = score
        
        return {
            "cibil_score": score,
            "source": "CIBIL_API",
            "status": "VERIFIED",
            "last_updated": "2024-01-01"
        }
    
    def _generate_realistic_score(self, email: str) -> int:
        """
        Generate a realistic CIBIL score based on email hash
        This ensures consistent scores for the same email
        """
        # Use email hash to generate consistent score
        email_hash = hash(email.lower())
        
        # Map hash to score range (300-900)
        # Most users fall in 600-800 range (realistic distribution)
        score_ranges = [
            (300, 550),   # Poor credit - 10% chance
            (550, 650),   # Fair credit - 20% chance
            (650, 750),   # Good credit - 40% chance
            (750, 850),   # Very good credit - 25% chance
            (850, 900),   # Excellent credit - 5% chance
        ]
        
        # Use hash to select range
        range_index = abs(email_hash) % 100
        
        if range_index < 10:
            min_score, max_score = score_ranges[0]
        elif range_index < 30:
            min_score, max_score = score_ranges[1]
        elif range_index < 70:
            min_score, max_score = score_ranges[2]
        elif range_index < 95:
            min_score, max_score = score_ranges[3]
        else:
            min_score, max_score = score_ranges[4]
        
        # Generate score within range with some variation
        base_score = min_score + (abs(email_hash) % (max_score - min_score + 1))
        
        # Add small random variation (±10 points) for realism
        variation = random.randint(-10, 10)
        final_score = max(300, min(900, base_score + variation))
        
        return final_score
    
    def add_user_score(self, email: str, score: int):
        """Manually add/update a user's CIBIL score (for testing)"""
        if not (300 <= score <= 900):
            raise ValueError("CIBIL score must be between 300 and 900")
        self.cibil_database[email.lower()] = score

# Create singleton instance
cibil_service = CIBILService()
