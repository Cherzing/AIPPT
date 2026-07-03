import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Optional

from fastapi import Request
from starlette.responses import Response

from utils.get_env import get_user_config_path_env, is_disable_auth_enabled
from utils.user_config_store import read_user_config_file, update_user_config_file

SESSION_COOKIE_NAME = "aippt_session"
PBKDF2_ITERATIONS = 200_000
SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
AUTH_CONFIG_FIELDS = (
    "AUTH_USERNAME",
    "AUTH_PASSWORD_HASH",
    "AUTH_SECRET_KEY",
    "AUTH_USERS",
)


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _base64url_decode(value: str) -> bytes:
    padded = value + "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(padded.encode("utf-8"))


def _load_user_config() -> dict:
    user_config_path = get_user_config_path_env()
    if not user_config_path:
        return {}

    try:
        return read_user_config_file(user_config_path)
    except Exception:
        return {}


def _save_user_config(config: dict, removed_keys: tuple[str, ...] = ()) -> None:
    user_config_path = get_user_config_path_env()
    if not user_config_path:
        raise ValueError("USER_CONFIG_PATH is not set")

    auth_config = {
        key: config[key]
        for key in AUTH_CONFIG_FIELDS
        if key in config
    }

    def merge_auth_config(existing: dict) -> dict:
        existing.update(auth_config)
        for key in removed_keys:
            existing.pop(key, None)
        return existing

    update_user_config_file(user_config_path, merge_auth_config)


def _clean_username(username: str) -> str:
    return (username or "").strip()


def _get_auth_users(config: dict) -> list[dict]:
    raw_users = config.get("AUTH_USERS")
    users: list[dict] = []
    if isinstance(raw_users, list):
        for raw_user in raw_users:
            if not isinstance(raw_user, dict):
                continue
            username = _clean_username(str(raw_user.get("username") or ""))
            password_hash = raw_user.get("password_hash")
            role = raw_user.get("role")
            if username and isinstance(password_hash, str) and password_hash:
                token_version = raw_user.get("token_version", 1)
                if not isinstance(token_version, int) or token_version < 1:
                    token_version = 1
                users.append(
                    {
                        "username": username,
                        "password_hash": password_hash,
                        "role": "admin" if role == "admin" else "user",
                        "token_version": token_version,
                    }
                )

    if users:
        return users

    legacy_username = _clean_username(str(config.get("AUTH_USERNAME") or ""))
    legacy_hash = config.get("AUTH_PASSWORD_HASH")
    if legacy_username and isinstance(legacy_hash, str) and legacy_hash:
        return [
            {
                "username": legacy_username,
                "password_hash": legacy_hash,
                "role": "admin",
                "token_version": 1,
            }
        ]

    return []


def _save_auth_users(config: dict, users: list[dict]) -> None:
    config["AUTH_USERS"] = users
    admin = next((user for user in users if user.get("role") == "admin"), None)
    first = admin or (users[0] if users else None)
    if first:
        config["AUTH_USERNAME"] = first["username"]
        config["AUTH_PASSWORD_HASH"] = first["password_hash"]
    else:
        config.pop("AUTH_USERNAME", None)
        config.pop("AUTH_PASSWORD_HASH", None)


def _find_auth_user(config: dict, username: str) -> Optional[dict]:
    cleaned_username = _clean_username(username)
    for user in _get_auth_users(config):
        if hmac.compare_digest(cleaned_username, user["username"]):
            return user
    return None


def _hash_password(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )


def _encode_password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = _hash_password(password, salt)
    salt_encoded = _base64url_encode(salt)
    digest_encoded = _base64url_encode(digest)
    return (
        f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt_encoded}${digest_encoded}"
    )


def _verify_password_hash(password: str, encoded_hash: str) -> bool:
    try:
        algorithm, iterations_str, salt_encoded, digest_encoded = encoded_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False

        iterations = int(iterations_str)
        salt = _base64url_decode(salt_encoded)
        expected_digest = _base64url_decode(digest_encoded)
        actual_digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt, iterations
        )
        return hmac.compare_digest(actual_digest, expected_digest)
    except Exception:
        return False


def _get_or_create_auth_secret(config: dict) -> str:
    secret = config.get("AUTH_SECRET_KEY")
    if secret:
        return secret

    secret = _base64url_encode(secrets.token_bytes(32))
    config["AUTH_SECRET_KEY"] = secret
    _save_user_config(config)
    return secret


def is_auth_configured() -> bool:
    config = _load_user_config()
    return bool(_get_auth_users(config))


def get_configured_auth_username() -> Optional[str]:
    config = _load_user_config()
    users = _get_auth_users(config)
    admin = next((user for user in users if user.get("role") == "admin"), None)
    selected_user = admin or (users[0] if users else None)
    if selected_user:
        return selected_user["username"]
    return None


def get_user_role(username: str) -> Optional[str]:
    config = _load_user_config()
    user = _find_auth_user(config, username)
    if not user:
        return None
    return user.get("role") or "user"


def get_current_user_profile(username: str) -> dict:
    config = _load_user_config()
    user = _find_auth_user(config, username)
    if not user:
        raise ValueError("User not found")
    return {
        "username": user["username"],
        "role": user.get("role") or "user",
    }


def list_auth_users() -> list[dict]:
    config = _load_user_config()
    return [
        {
            "username": user["username"],
            "role": user.get("role") or "user",
        }
        for user in _get_auth_users(config)
    ]


def setup_initial_credentials(username: str, password: str) -> None:
    cleaned_username = _clean_username(username)
    if len(cleaned_username) < 3:
        raise ValueError("Username must be at least 3 characters")

    if len(password or "") < 6:
        raise ValueError("Password must be at least 6 characters")

    config = _load_user_config()
    if _get_auth_users(config):
        raise ValueError("Credentials already configured")

    _save_auth_users(
        config,
        [
            {
                "username": cleaned_username,
                "password_hash": _encode_password_hash(password),
                "role": "admin",
                "token_version": 1,
            }
        ],
    )
    _get_or_create_auth_secret(config)
    _save_user_config(config)


def register_user(username: str, password: str) -> None:
    cleaned_username = _clean_username(username)
    if len(cleaned_username) < 3:
        raise ValueError("Username must be at least 3 characters")

    if len(password or "") < 6:
        raise ValueError("Password must be at least 6 characters")

    config = _load_user_config()
    users = _get_auth_users(config)
    if not users:
        raise ValueError("Admin account must be created before registration")

    if _find_auth_user(config, cleaned_username):
        raise ValueError("Username already exists")

    users.append(
        {
            "username": cleaned_username,
            "password_hash": _encode_password_hash(password),
            "role": "user",
            "token_version": 1,
        }
    )
    _save_auth_users(config, users)
    _get_or_create_auth_secret(config)
    _save_user_config(config)


def create_managed_user(username: str, password: str) -> None:
    register_user(username, password)


def rename_managed_user(username: str, new_username: str) -> dict:
    cleaned_username = _clean_username(username)
    cleaned_new_username = _clean_username(new_username)
    if len(cleaned_new_username) < 3:
        raise ValueError("Username must be at least 3 characters")

    config = _load_user_config()
    users = _get_auth_users(config)
    target_user = next(
        (user for user in users if hmac.compare_digest(user["username"], cleaned_username)),
        None,
    )
    if not target_user:
        raise ValueError("User not found")
    if target_user.get("role") == "admin":
        raise ValueError("Admin username cannot be changed here")
    if any(
        hmac.compare_digest(user["username"], cleaned_new_username)
        for user in users
        if not hmac.compare_digest(user["username"], cleaned_username)
    ):
        raise ValueError("Username already exists")

    target_user["username"] = cleaned_new_username
    target_user["token_version"] = int(target_user.get("token_version") or 1) + 1
    _save_auth_users(config, users)
    _save_user_config(config)
    return {"username": cleaned_new_username, "role": "user"}


def reset_managed_user_password(username: str, password: str) -> None:
    cleaned_username = _clean_username(username)
    if len(password or "") < 6:
        raise ValueError("Password must be at least 6 characters")

    config = _load_user_config()
    users = _get_auth_users(config)
    for user in users:
        if hmac.compare_digest(user["username"], cleaned_username):
            if user.get("role") == "admin":
                raise ValueError("Admin password cannot be reset here")
            user["password_hash"] = _encode_password_hash(password)
            user["token_version"] = int(user.get("token_version") or 1) + 1
            _save_auth_users(config, users)
            _save_user_config(config)
            return
    raise ValueError("User not found")


def delete_managed_user(username: str) -> None:
    cleaned_username = _clean_username(username)
    config = _load_user_config()
    users = _get_auth_users(config)
    target_user = next(
        (user for user in users if hmac.compare_digest(user["username"], cleaned_username)),
        None,
    )
    if not target_user:
        raise ValueError("User not found")
    if target_user.get("role") == "admin":
        raise ValueError("Admin user cannot be deleted")

    remaining_users = [
        user
        for user in users
        if not hmac.compare_digest(user["username"], cleaned_username)
    ]
    _save_auth_users(config, remaining_users)
    _save_user_config(config)


def change_current_user_password(
    username: str,
    current_password: str,
    new_password: str,
) -> dict:
    cleaned_username = _clean_username(username)
    if len(new_password or "") < 6:
        raise ValueError("Password must be at least 6 characters")
    if not verify_credentials(cleaned_username, current_password):
        raise ValueError("Current password is incorrect")

    config = _load_user_config()
    users = _get_auth_users(config)
    for user in users:
        if hmac.compare_digest(user["username"], cleaned_username):
            user["password_hash"] = _encode_password_hash(new_password)
            user["token_version"] = int(user.get("token_version") or 1) + 1
            _save_auth_users(config, users)
            _save_user_config(config)
            return {
                "username": user["username"],
                "role": user.get("role") or "user",
            }
    raise ValueError("User not found")


def force_set_credentials(username: str, password: str) -> None:
    """Overwrite stored credentials; used by env-based preseed/override."""
    cleaned_username = (username or "").strip()
    if len(cleaned_username) < 3:
        raise ValueError("Username must be at least 3 characters")

    if len(password or "") < 6:
        raise ValueError("Password must be at least 6 characters")

    config = _load_user_config()
    _save_auth_users(
        config,
        [
            {
                "username": cleaned_username,
                "password_hash": _encode_password_hash(password),
                "role": "admin",
                "token_version": 1,
            }
        ],
    )
    # Rotate the signing secret so any previously-issued tokens stop validating.
    config["AUTH_SECRET_KEY"] = _base64url_encode(secrets.token_bytes(32))
    _save_user_config(config)


def clear_stored_credentials() -> None:
    """Remove stored credentials; next boot will request setup again."""
    config = _load_user_config()
    removed = False
    for key in ("AUTH_USERNAME", "AUTH_PASSWORD_HASH", "AUTH_SECRET_KEY", "AUTH_USERS"):
        if key in config:
            config.pop(key, None)
            removed = True
    if removed:
        _save_user_config(config, removed_keys=AUTH_CONFIG_FIELDS)


def verify_credentials(username: str, password: str) -> bool:
    config = _load_user_config()
    user = _find_auth_user(config, username)
    if not user:
        return False

    return _verify_password_hash(password or "", user["password_hash"])


def _sign_payload(payload_encoded: str, secret: str) -> str:
    signature = hmac.new(
        secret.encode("utf-8"), payload_encoded.encode("utf-8"), hashlib.sha256
    ).digest()
    return _base64url_encode(signature)


def create_session_token(username: str) -> str:
    config = _load_user_config()
    secret = _get_or_create_auth_secret(config)
    user = _find_auth_user(config, username)
    role = (user.get("role") if user else None) or "user"
    token_version = int((user or {}).get("token_version") or 1)

    issued_at = int(time.time())
    payload = {
        "v": 1,
        "u": username,
        "r": role,
        "tv": token_version,
        "iat": issued_at,
        "exp": issued_at + SESSION_TTL_SECONDS,
    }

    payload_encoded = _base64url_encode(
        json.dumps(payload, separators=(",", ":")).encode("utf-8")
    )
    signature_encoded = _sign_payload(payload_encoded, secret)
    return f"{payload_encoded}.{signature_encoded}"


def validate_session_token(token: Optional[str]) -> Optional[str]:
    info = validate_session_token_info(token)
    if not info:
        return None
    return info["username"]


def validate_session_token_info(token: Optional[str]) -> Optional[dict]:
    if not token:
        return None

    config = _load_user_config()
    users = _get_auth_users(config)
    if not users:
        return None

    secret = config.get("AUTH_SECRET_KEY")
    if not secret:
        return None

    try:
        payload_encoded, signature_encoded = token.split(".", 1)
    except ValueError:
        return None

    expected_signature = _sign_payload(payload_encoded, secret)
    if not hmac.compare_digest(signature_encoded, expected_signature):
        return None

    try:
        payload_raw = _base64url_decode(payload_encoded)
        payload = json.loads(payload_raw)
    except Exception:
        return None

    username = payload.get("u")
    version = payload.get("v")
    token_version = payload.get("tv", 1)
    expires_at = payload.get("exp")
    if not isinstance(username, str) or not isinstance(expires_at, int):
        return None

    if version != 1 or not isinstance(token_version, int):
        return None

    user = _find_auth_user(config, username)
    if not user:
        return None

    if token_version != int(user.get("token_version") or 1):
        return None

    if expires_at < int(time.time()):
        return None

    return {
        "username": user["username"],
        "role": user.get("role") or "user",
    }


def get_session_token_from_request(request: Request) -> Optional[str]:
    cookie_token = request.cookies.get(SESSION_COOKIE_NAME)
    if cookie_token:
        return cookie_token

    auth_header = request.headers.get("Authorization", "")
    if auth_header.lower().startswith("bearer "):
        return auth_header[7:].strip() or None

    return None


def get_basic_auth_credentials_from_request(
    request: Request,
) -> Optional[tuple[str, str]]:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.lower().startswith("basic "):
        return None

    encoded_value = auth_header[6:].strip()
    if not encoded_value:
        return None

    try:
        decoded_value = base64.b64decode(encoded_value).decode("utf-8")
    except Exception:
        return None

    if ":" not in decoded_value:
        return None

    username, password = decoded_value.split(":", 1)
    return username, password


def get_auth_status(session_token: Optional[str] = None) -> dict:
    config = _load_user_config()
    configured = bool(_get_auth_users(config))

    if not configured:
        return {
            "configured": False,
            "authenticated": False,
            "username": None,
            "role": None,
        }

    session_info = validate_session_token_info(session_token)
    return {
        "configured": True,
        "authenticated": bool(session_info),
        "username": session_info["username"] if session_info else None,
        "role": session_info["role"] if session_info else None,
    }


def get_internal_auth_headers() -> dict[str, str]:
    """Return auth headers for trusted same-host service-to-service API calls."""
    if is_disable_auth_enabled():
        return {}

    username = get_configured_auth_username()
    if not username:
        return {}

    return {"Authorization": f"Bearer {create_session_token(username)}"}


def _is_secure_request(request: Request) -> bool:
    forwarded_proto = request.headers.get("x-forwarded-proto", "")
    if forwarded_proto.lower() == "https":
        return True
    return request.url.scheme == "https"


def set_session_cookie(response: Response, token: str, request: Request) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        secure=_is_secure_request(request),
        samesite="lax",
        path="/",
    )


def clear_session_cookie(response: Response, request: Request) -> None:
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        httponly=True,
        secure=_is_secure_request(request),
        samesite="lax",
        path="/",
    )
