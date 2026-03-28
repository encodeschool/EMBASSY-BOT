from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from pydantic import BaseModel
import httpx

from db.session import SessionLocal
from db.models import QuestionLog, User
from api.dependencies import get_current_admin
from config import BOT_TOKEN
from locales.translations import get_text

router = APIRouter()


@router.get("")
async def list_questions(admin_id: int = Depends(get_current_admin)):
    async with SessionLocal() as session:
        questions = (await session.execute(select(QuestionLog))).scalars().all()
        result = []
        for q in questions:
            user = (await session.execute(select(User).where(User.id == q.user_id))).scalar()
            result.append({
                "id": q.id,
                "user_id": q.user_id,
                "user_name": user.full_name if user else "Unknown",
                "user_telegram_id": user.telegram_id if user else None,
                "text": q.text,
                "answer": q.answer,
                "answered": q.answer is not None,
            })
    return result


class ReplyBody(BaseModel):
    answer: str


@router.post("/{question_id}/reply")
async def reply_question(
    question_id: int,
    body: ReplyBody,
    admin_id: int = Depends(get_current_admin),
):
    if not body.answer.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Answer cannot be empty")

    async with SessionLocal() as session:
        q = (await session.execute(select(QuestionLog).where(QuestionLog.id == question_id))).scalar()
        if not q:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

        q.answer = body.answer.strip()
        await session.commit()

        user = (await session.execute(select(User).where(User.id == q.user_id))).scalar()

    # Notify user in their language
    if user:
        lang = (user.language or "uz").lower()
        msg = get_text("notify_question_answered", lang, question=q.text, answer=q.answer)
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                    json={"chat_id": user.telegram_id, "text": msg},
                    timeout=5,
                )
        except Exception:
            pass

    return {"id": question_id, "answer": q.answer}
