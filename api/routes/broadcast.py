from fastapi import APIRouter, Depends
from sqlalchemy import select
from pydantic import BaseModel
import httpx

from db.session import SessionLocal
from db.models import User
from api.dependencies import get_current_admin
from config import BOT_TOKEN

router = APIRouter()


class BroadcastBody(BaseModel):
    message: str


@router.post("")
async def broadcast(body: BroadcastBody, admin_id: int = Depends(get_current_admin)):
    async with SessionLocal() as session:
        users = (await session.execute(select(User))).scalars().all()

    sent = 0
    failed = 0
    async with httpx.AsyncClient() as client:
        for user in users:
            try:
                resp = await client.post(
                    f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                    json={"chat_id": user.telegram_id, "text": body.message},
                    timeout=5,
                )
                if resp.status_code == 200:
                    sent += 1
                else:
                    failed += 1
            except Exception:
                failed += 1

    return {"sent": sent, "failed": failed, "total": len(users)}
