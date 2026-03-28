from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from api.auth import create_token
from api import token_store

router = APIRouter()


class TokenLoginBody(BaseModel):
    token: str


@router.post("/token-login")
async def token_login(body: TokenLoginBody):
    admin_id = token_store.consume(body.token)
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired link. Ask the bot for a new one with /webadmin",
        )
    jwt = create_token(admin_id)
    return {"token": jwt, "user_id": admin_id}
