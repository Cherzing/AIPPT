from utils.simple_auth import (
    change_current_user_password,
    create_managed_user,
    create_session_token,
    delete_managed_user,
    get_current_user_profile,
    get_auth_status,
    get_user_role,
    list_auth_users,
    register_user,
    rename_managed_user,
    reset_managed_user_password,
    setup_initial_credentials,
    validate_session_token,
    verify_credentials,
)


def test_first_setup_creates_admin_and_registration_creates_user(monkeypatch, tmp_path):
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "userConfig.json"))
    monkeypatch.delenv("DISABLE_AUTH", raising=False)

    setup_initial_credentials("admin", "secret123")
    register_user("worker", "secret456")

    assert verify_credentials("admin", "secret123") is True
    assert verify_credentials("worker", "secret456") is True
    assert get_user_role("admin") == "admin"
    assert get_user_role("worker") == "user"


def test_session_status_includes_role_for_registered_user(monkeypatch, tmp_path):
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "userConfig.json"))
    monkeypatch.delenv("DISABLE_AUTH", raising=False)

    setup_initial_credentials("admin", "secret123")
    register_user("worker", "secret456")
    token = create_session_token("worker")

    assert validate_session_token(token) == "worker"
    assert get_auth_status(token) == {
        "configured": True,
        "authenticated": True,
        "username": "worker",
        "role": "user",
    }


def test_admin_management_can_create_reset_and_delete_normal_users(monkeypatch, tmp_path):
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "userConfig.json"))
    monkeypatch.delenv("DISABLE_AUTH", raising=False)

    setup_initial_credentials("admin", "secret123")
    create_managed_user("worker", "secret456")

    assert list_auth_users() == [
        {"username": "admin", "role": "admin"},
        {"username": "worker", "role": "user"},
    ]
    assert verify_credentials("worker", "secret456") is True

    admin_token = create_session_token("admin")
    worker_token = create_session_token("worker")

    reset_managed_user_password("worker", "newpass123")

    assert verify_credentials("worker", "secret456") is False
    assert verify_credentials("worker", "newpass123") is True
    assert validate_session_token(admin_token) == "admin"
    assert validate_session_token(worker_token) is None

    worker_token = create_session_token("worker")
    delete_managed_user("worker")

    assert verify_credentials("worker", "newpass123") is False
    assert validate_session_token(worker_token) is None
    assert list_auth_users() == [{"username": "admin", "role": "admin"}]


def test_admin_management_cannot_delete_admin_user(monkeypatch, tmp_path):
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "userConfig.json"))
    monkeypatch.delenv("DISABLE_AUTH", raising=False)

    setup_initial_credentials("admin", "secret123")

    try:
        delete_managed_user("admin")
    except ValueError as exc:
        assert "admin" in str(exc).lower()
    else:
        raise AssertionError("Expected admin deletion to be rejected")


def test_admin_management_can_rename_normal_user(monkeypatch, tmp_path):
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "userConfig.json"))
    monkeypatch.delenv("DISABLE_AUTH", raising=False)

    setup_initial_credentials("admin", "secret123")
    create_managed_user("worker", "secret456")
    worker_token = create_session_token("worker")

    renamed = rename_managed_user("worker", "operator")

    assert renamed == {"username": "operator", "role": "user"}
    assert verify_credentials("worker", "secret456") is False
    assert verify_credentials("operator", "secret456") is True
    assert validate_session_token(worker_token) is None
    assert list_auth_users() == [
        {"username": "admin", "role": "admin"},
        {"username": "operator", "role": "user"},
    ]


def test_admin_management_cannot_rename_admin_or_duplicate_user(monkeypatch, tmp_path):
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "userConfig.json"))
    monkeypatch.delenv("DISABLE_AUTH", raising=False)

    setup_initial_credentials("admin", "secret123")
    create_managed_user("worker", "secret456")
    create_managed_user("operator", "secret789")

    for old_username, new_username in (("admin", "root"), ("worker", "operator")):
        try:
            rename_managed_user(old_username, new_username)
        except ValueError:
            pass
        else:
            raise AssertionError("Expected rename to be rejected")


def test_user_profile_and_password_change(monkeypatch, tmp_path):
    monkeypatch.setenv("USER_CONFIG_PATH", str(tmp_path / "userConfig.json"))
    monkeypatch.delenv("DISABLE_AUTH", raising=False)

    setup_initial_credentials("admin", "secret123")
    create_managed_user("worker", "secret456")
    worker_token = create_session_token("worker")

    assert get_current_user_profile("worker") == {"username": "worker", "role": "user"}

    changed = change_current_user_password("worker", "secret456", "newpass123")

    assert changed == {"username": "worker", "role": "user"}
    assert verify_credentials("worker", "secret456") is False
    assert verify_credentials("worker", "newpass123") is True
    assert validate_session_token(worker_token) is None

    try:
        change_current_user_password("worker", "wrong-password", "another123")
    except ValueError as exc:
        assert "current" in str(exc).lower()
    else:
        raise AssertionError("Expected current password validation to fail")
