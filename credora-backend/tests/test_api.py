from app.main import app
from app.api.loan import get_current_user, get_admin_user
from app.models.user import User

# Mocking authentication locally for tests
def override_get_current_user():
    return User(id=1, email="test@credora.com", full_name="Test User", is_admin=False)

def override_get_admin_user():
    return User(id=99, email="admin@credora.com", full_name="Admin User", is_admin=True)

app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[get_admin_user] = override_get_admin_user

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data

def test_get_my_applications(client):
    # This hits /api/loan/my-applications
    response = client.get("/api/loan/my-applications")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_admin_all_applications(client):
    response = client.get("/api/loan/admin/all-applications")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
