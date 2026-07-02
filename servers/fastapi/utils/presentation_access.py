from typing import Any, Optional

from fastapi import HTTPException, Request

from utils.get_env import is_disable_auth_enabled


def get_request_username(request: Optional[Request]) -> Optional[str]:
    if request is None:
        return None
    username = getattr(request.state, "auth_username", None)
    if isinstance(username, str) and username.strip():
        return username.strip()
    return None


def get_request_role(request: Optional[Request]) -> str:
    if request is None or is_disable_auth_enabled():
        return "admin"
    role = getattr(request.state, "auth_role", None)
    return "admin" if role == "admin" else "user"


def can_access_presentation(
    presentation: Any,
    username: Optional[str],
    role: Optional[str],
) -> bool:
    if role == "admin":
        return True

    owner_user = getattr(presentation, "owner_user", None)
    if not owner_user:
        return False

    return bool(username and owner_user == username)


def require_presentation_access(
    presentation: Any,
    request: Optional[Request],
) -> None:
    if not can_access_presentation(
        presentation,
        get_request_username(request),
        get_request_role(request),
    ):
        raise HTTPException(status_code=403, detail="无权访问该演示文稿")


def request_owner_username(request: Optional[Request]) -> Optional[str]:
    username = get_request_username(request)
    return username or None
