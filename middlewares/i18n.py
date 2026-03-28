from aiogram.utils.i18n import I18n
from aiogram import BaseMiddleware
from sqlalchemy import select
from db.session import SessionLocal
from db.models import User
from aiogram.types import TelegramObject

# Initialize i18n
i18n = I18n(path="locales", default_locale="en", domain="messages")

# Helper function for translations
def _(text: str) -> str:
    return i18n.gettext(text)

# Middleware to set user locale
class DBLocaleMiddleware(BaseMiddleware):
    async def __call__(self, handler, event: TelegramObject, data: dict):
        user = data.get("event_from_user")
        if user:
            async with SessionLocal() as session:
                result = await session.execute(
                    select(User.language).where(User.telegram_id == user.id)
                )
                lang = result.scalar() or "en"
            # Set locale for this event
            data["locale"] = lang.lower()
            i18n.ctx_locale.set(lang.lower())  # important: set locale context
        return await handler(event, data)

# Instantiate middleware
i18n_middleware = DBLocaleMiddleware()