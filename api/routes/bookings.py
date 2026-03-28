from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from pydantic import BaseModel
import httpx

from db.session import SessionLocal
from db.models import Booking, User
from api.dependencies import get_current_admin
from config import BOT_TOKEN
from locales.translations import get_text

router = APIRouter()


@router.get("")
async def list_bookings(admin_id: int = Depends(get_current_admin)):
    async with SessionLocal() as session:
        bookings = (await session.execute(select(Booking).order_by(Booking.date, Booking.time))).scalars().all()
        result = []
        for b in bookings:
            user = (await session.execute(select(User).where(User.id == b.user_id))).scalar()
            result.append({
                "id": b.id,
                "user_id": b.user_id,
                "user_name": user.full_name if user else "Unknown",
                "user_telegram_id": user.telegram_id if user else None,
                "date": b.date,
                "time": b.time,
                "status": b.status,
            })
    return result


class StatusBody(BaseModel):
    status: str


@router.patch("/{booking_id}/status")
async def update_status(
    booking_id: int,
    body: StatusBody,
    admin_id: int = Depends(get_current_admin),
):
    if body.status not in ("pending", "approved", "rejected"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status value")

    async with SessionLocal() as session:
        booking = (await session.execute(select(Booking).where(Booking.id == booking_id))).scalar()
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        booking.status = body.status
        await session.commit()

        user = (await session.execute(select(User).where(User.id == booking.user_id))).scalar()

    # Notify user in their language
    if user:
        lang = (user.language or "uz").lower()
        status_label = get_text(f"status_{body.status}", lang)
        msg = get_text("notify_booking_status", lang, date=booking.date, time=booking.time, status=status_label)
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                    json={"chat_id": user.telegram_id, "text": msg},
                    timeout=5,
                )
        except Exception:
            pass

    return {"id": booking_id, "status": body.status}
