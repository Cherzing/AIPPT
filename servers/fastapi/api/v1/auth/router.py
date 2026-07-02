from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

from utils.simple_auth import (
    change_current_user_password,
    clear_session_cookie,
    create_managed_user,
    create_session_token,
    delete_managed_user,
    get_current_user_profile,
    get_auth_status,
    get_basic_auth_credentials_from_request,
    get_session_token_from_request,
    get_user_role,
    is_auth_configured,
    list_auth_users,
    register_user,
    rename_managed_user,
    reset_managed_user_password,
    set_session_cookie,
    setup_initial_credentials,
    verify_credentials,
)
from utils.get_env import is_disable_auth_enabled

API_V1_AUTH_ROUTER = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


class AuthCredentialsRequest(BaseModel):
    username: str = Field(min_length=3, max_length=128)
    password: str = Field(min_length=6, max_length=256)


class ManagedUserResponse(BaseModel):
    username: str
    role: str


class RenameUserRequest(BaseModel):
    username: str = Field(min_length=3, max_length=128)


class ResetPasswordRequest(BaseModel):
    password: str = Field(min_length=6, max_length=256)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=6, max_length=256)
    password: str = Field(min_length=6, max_length=256)


def require_authenticated(request: Request) -> dict:
    if is_disable_auth_enabled():
        return {"username": "electron", "role": "admin"}

    auth_status = get_auth_status(get_session_token_from_request(request))
    if not auth_status.get("authenticated"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return auth_status


def require_admin(request: Request) -> dict:
    if is_disable_auth_enabled():
        return {"username": "electron", "role": "admin"}

    auth_status = get_auth_status(get_session_token_from_request(request))
    if not auth_status.get("authenticated"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    if auth_status.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin permission is required")
    return auth_status


async def sync_presentation_owner(old_username: str, new_username: str) -> None:
    try:
        from sqlalchemy import update

        from models.sql.presentation import PresentationModel
        from services.database import async_session_maker

        async with async_session_maker() as sql_session:
            await sql_session.execute(
            update(PresentationModel)
            .where(PresentationModel.owner_user == old_username)
            .values(owner_user=new_username)
            )
            await sql_session.commit()
    except Exception:
        return


@API_V1_AUTH_ROUTER.get("/status")
async def get_status(request: Request):
    if is_disable_auth_enabled():
        return {
            "configured": True,
            "authenticated": True,
            "username": "electron",
            "role": "admin",
        }
    token = get_session_token_from_request(request)
    return get_auth_status(token)


@API_V1_AUTH_ROUTER.get("/verify")
async def verify_session(request: Request):
    if is_disable_auth_enabled():
        return {"authenticated": True, "username": "electron", "role": "admin"}

    auth_status = get_auth_status(get_session_token_from_request(request))
    if not auth_status["configured"]:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not auth_status["authenticated"]:
        basic_credentials = get_basic_auth_credentials_from_request(request)
        if basic_credentials and verify_credentials(
            basic_credentials[0], basic_credentials[1]
        ):
            return {
                "authenticated": True,
                "username": basic_credentials[0].strip(),
                "role": get_user_role(basic_credentials[0].strip()) or "user",
            }
        raise HTTPException(status_code=401, detail="Unauthorized")

    return {
        "authenticated": True,
        "username": auth_status.get("username"),
        "role": auth_status.get("role"),
    }


@API_V1_AUTH_ROUTER.post("/setup")
async def setup_credentials(body: AuthCredentialsRequest, request: Request):
    if is_auth_configured():
        raise HTTPException(status_code=409, detail="Credentials already configured")

    try:
        setup_initial_credentials(body.username, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    username = body.username.strip()
    return JSONResponse(
        {
            "configured": True,
            "authenticated": False,
            "username": username,
            "role": "admin",
        }
    )


@API_V1_AUTH_ROUTER.post("/register")
async def register(body: AuthCredentialsRequest, request: Request):
    if not is_auth_configured():
        raise HTTPException(status_code=428, detail="请先创建管理员账号")

    try:
        register_user(body.username, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    username = body.username.strip()
    token = create_session_token(username)
    response = JSONResponse(
        {
            "configured": True,
            "authenticated": True,
            "username": username,
            "role": "user",
            "access_token": token,
            "token_type": "bearer",
        }
    )
    set_session_cookie(response, token, request)
    return response


@API_V1_AUTH_ROUTER.get("/me", response_model=ManagedUserResponse)
async def get_me(request: Request):
    auth_status = require_authenticated(request)
    try:
        return get_current_user_profile(str(auth_status.get("username") or ""))
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@API_V1_AUTH_ROUTER.put("/me", response_model=ManagedUserResponse)
async def update_me(
    body: RenameUserRequest,
    request: Request,
):
    auth_status = require_authenticated(request)
    if auth_status.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Admin username cannot be changed here")

    old_username = str(auth_status.get("username") or "")
    try:
        profile = rename_managed_user(old_username, body.username)
        await sync_presentation_owner(old_username, profile["username"])
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    token = create_session_token(profile["username"])
    response = JSONResponse(profile)
    set_session_cookie(response, token, request)
    return response


@API_V1_AUTH_ROUTER.put("/me/password", response_model=ManagedUserResponse)
async def change_me_password(body: ChangePasswordRequest, request: Request):
    auth_status = require_authenticated(request)
    try:
        profile = change_current_user_password(
            str(auth_status.get("username") or ""),
            body.current_password,
            body.password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    token = create_session_token(profile["username"])
    response = JSONResponse(profile)
    set_session_cookie(response, token, request)
    return response


@API_V1_AUTH_ROUTER.get("/users", response_model=list[ManagedUserResponse])
async def list_users(request: Request):
    require_admin(request)
    return list_auth_users()


@API_V1_AUTH_ROUTER.post("/users", response_model=ManagedUserResponse)
async def create_user(body: AuthCredentialsRequest, request: Request):
    require_admin(request)
    try:
        create_managed_user(body.username, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"username": body.username.strip(), "role": "user"}


@API_V1_AUTH_ROUTER.put("/users/{username}", response_model=ManagedUserResponse)
async def rename_user(
    username: str,
    body: RenameUserRequest,
    request: Request,
):
    require_admin(request)
    try:
        profile = rename_managed_user(username, body.username)
        await sync_presentation_owner(username.strip(), profile["username"])
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return profile


@API_V1_AUTH_ROUTER.put("/users/{username}/password", response_model=ManagedUserResponse)
async def reset_user_password(
    username: str,
    body: ResetPasswordRequest,
    request: Request,
):
    require_admin(request)
    try:
        reset_managed_user_password(username, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"username": username.strip(), "role": "user"}


@API_V1_AUTH_ROUTER.delete("/users/{username}", status_code=204)
async def delete_user(username: str, request: Request):
    require_admin(request)
    try:
        delete_managed_user(username)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@API_V1_AUTH_ROUTER.post("/login")
async def login(body: AuthCredentialsRequest, request: Request):
    if not is_auth_configured():
        raise HTTPException(status_code=428, detail="需要先设置登录信息")

    if not verify_credentials(body.username, body.password):
        raise HTTPException(status_code=401, detail="Unauthorized")

    username = body.username.strip()
    token = create_session_token(username)
    response = JSONResponse(
        {
            "configured": True,
            "authenticated": True,
            "username": username,
            "role": get_user_role(username) or "user",
            "access_token": token,
            "token_type": "bearer",
        }
    )
    set_session_cookie(response, token, request)
    return response


@API_V1_AUTH_ROUTER.post("/logout")
async def logout(request: Request):
    response = JSONResponse({"success": True})
    clear_session_cookie(response, request)
    return response
