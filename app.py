import asyncio
from aiogram import Bot, Dispatcher
from config import BOT_TOKEN
from handlers import user, admin
from db.models import Base
from db.session import engine
from middlewares.i18n import i18n_middleware

async def main():
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()

    # Add i18n middleware
    dp.update.middleware(i18n_middleware)

    # Include routers
    dp.include_router(user.router)
    dp.include_router(admin.router)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("[BOT] Starting polling...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())