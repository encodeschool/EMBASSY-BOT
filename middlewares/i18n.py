# middlewares/i18n.py
from aiogram import BaseMiddleware
from aiogram.types import TelegramObject
from sqlalchemy import select
from db.session import SessionLocal
from db.models import User
from locales.translations import get_text, SUPPORTED_LANGS


DEFAULT_LANG = "uz"


class DBLocaleMiddleware(BaseMiddleware):
    async def __call__(self, handler, event: TelegramObject, data: dict):
        from_user = data.get("event_from_user")
        lang = DEFAULT_LANG

        if from_user:
            try:
                async with SessionLocal() as session:
                    result = await session.execute(
                        select(User.language).where(User.telegram_id == from_user.id)
                    )
                    db_lang = result.scalar()
                    if db_lang and db_lang.lower() in SUPPORTED_LANGS:
                        lang = db_lang.lower()
            except Exception as e:
                print(f"[i18n] DB locale fetch error: {e}")

        # Inject translation helper and lang code into handler data
        data["lang"] = lang
        data["_"] = lambda key, **kwargs: get_text(key, lang, **kwargs)

        return await handler(event, data)


i18n_middleware = DBLocaleMiddleware()
