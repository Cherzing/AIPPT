from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.v1.auth.router import API_V1_AUTH_ROUTER
from utils.simple_auth import register_user, setup_initial_credentials, validate_session_token


def _build_client() -> TestClient:
    app = FastAPI()
    app.include_router(API_V1_AUTH_ROUTER)
    return TestClient(app)


def test_login_returns_bearer_access_token(monkeypatch, tmp_path):
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "userConfig.json"))
    monkeypatch.delenv("DISABLE_AUTH", raising=False)
    setup_initial_credentials("admin", "secret123")

    client = _build_client()
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "secret123"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["configured"] is True
    assert payload["authenticated"] is True
    assert payload["username"] == "admin"
    assert payload["token_type"] == "bearer"
    assert isinstance(payload["access_token"], str)
    assert validate_session_token(payload["access_token"]) == "admin"


def test_current_user_profile_and_password_endpoints(monkeypatch, tmp_path):
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "userConfig.json"))
    monkeypatch.delenv("DISABLE_AUTH", raising=False)
    setup_initial_credentials("admin", "secret123")
    register_user("worker", "secret456")

    client = _build_client()
    login_response = client.post(
        "/api/v1/auth/login",
        json={"username": "worker", "password": "secret456"},
    )
    assert login_response.status_code == 200

    profile_response = client.get("/api/v1/auth/me")
    assert profile_response.status_code == 200
    assert profile_response.json() == {"username": "worker", "role": "user"}

    password_response = client.put(
        "/api/v1/auth/me/password",
        json={"current_password": "secret456", "password": "newpass123"},
    )
    assert password_response.status_code == 200
    assert password_response.json() == {"username": "worker", "role": "user"}

    old_login = client.post(
        "/api/v1/auth/login",
        json={"username": "worker", "password": "secret456"},
    )
    assert old_login.status_code == 401
    new_login = client.post(
        "/api/v1/auth/login",
        json={"username": "worker", "password": "newpass123"},
    )
    assert new_login.status_code == 200


def test_admin_can_rename_normal_user_endpoint(monkeypatch, tmp_path):
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "userConfig.json"))
    monkeypatch.delenv("DISABLE_AUTH", raising=False)
    setup_initial_credentials("admin", "secret123")
    register_user("worker", "secret456")

    client = _build_client()
    login_response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "secret123"},
    )
    assert login_response.status_code == 200

    response = client.put(
        "/api/v1/auth/users/worker",
        json={"username": "operator"},
    )
    assert response.status_code == 200
    assert response.json() == {"username": "operator", "role": "user"}

    renamed_login = client.post(
        "/api/v1/auth/login",
        json={"username": "operator", "password": "secret456"},
    )
    assert renamed_login.status_code == 200
