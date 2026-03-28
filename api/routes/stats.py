from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from db.session import SessionLocal
from db.models import User, Booking, QuestionLog
from api.dependencies import get_current_admin

router = APIRouter()


@router.get("")
async def get_stats(admin_id: int = Depends(get_current_admin)):
    async with SessionLocal() as session:
        total_users = (await session.execute(select(func.count(User.id)))).scalar()
        total_bookings = (await session.execute(select(func.count(Booking.id)))).scalar()
        approved = (await session.execute(
            select(func.count(Booking.id)).where(Booking.status == "approved")
        )).scalar()
        pending = (await session.execute(
            select(func.count(Booking.id)).where(Booking.status == "pending")
        )).scalar()
        rejected = (await session.execute(
            select(func.count(Booking.id)).where(Booking.status == "rejected")
        )).scalar()
        total_questions = (await session.execute(select(func.count(QuestionLog.id)))).scalar()
        answered = (await session.execute(
            select(func.count(QuestionLog.id)).where(QuestionLog.answer.isnot(None))
        )).scalar()

    return {
        "users": total_users,
        "bookings": {
            "total": total_bookings,
            "approved": approved,
            "pending": pending,
            "rejected": rejected,
        },
        "questions": {
            "total": total_questions,
            "answered": answered,
            "unanswered": total_questions - answered,
        },
    }
