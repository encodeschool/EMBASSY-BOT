# middlewares/i18n.py
from aiogram import BaseMiddleware
from aiogram.types import TelegramObject
from sqlalchemy import select
from db.session import SessionLocal
from db.models import User
from aiogram.utils.i18n import I18n

# -----------------------------
# Initialize i18n
# -----------------------------
# 'locales' folder should contain subfolders: en, ru, uz
# Each folder contains translation files (messages.po or messages.json)
i18n = I18n(path="locales", default_locale="uz", domain="messages")

# -----------------------------
# Middleware to set user locale from DB
# -----------------------------
class DBLocaleMiddleware(BaseMiddleware):
    async def __call__(self, handler, event: TelegramObject, data: dict):
        user = getattr(event, "from_user", None)
        lang = "uz"  # default language

        if user:
            try:
                async with SessionLocal() as session:
                    result = await session.execute(
                        select(User.language).where(User.telegram_id == user.id)
                    )
                    lang = result.scalar() or "en"
            except Exception as e:
                print(f"[i18n] DB locale fetch error: {e}")
                lang = "en"

        # Set the i18n context for this event
        i18n.ctx_locale.set(lang.lower())
        return await handler(event, data)

# -----------------------------
# Translation helper
# -----------------------------
# Always keep this a function, never overwrite it with a string
def _(text: str) -> str:
    return i18n.gettext(text)

# -----------------------------
# Middleware instance
# -----------------------------
i18n_middleware = DBLocaleMiddleware()