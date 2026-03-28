import asyncio
import os
import uvicorn
from aiogram import Bot, Dispatcher
from config import BOT_TOKEN
from handlers import user, admin
from db.models import Base
from db.session import engine
from middlewares.i18n import i18n_middleware

API_PORT = int(os.getenv("API_PORT", "8010"))


async def run_bot():
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher()
    dp.update.middleware(i18n_middleware)
    dp.include_router(user.router)
    dp.include_router(admin.router)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("[BOT] Starting polling...")
    await dp.start_polling(bot)


async def run_api():
    from api.main import app as fastapi_app
    config = uvicorn.Config(
        fastapi_app,
        host="0.0.0.0",
        port=API_PORT,
        log_level="info",
    )
    server = uvicorn.Server(config)
    print(f"[API] Admin API starting on http://localhost:{API_PORT}")
    try:
        await server.serve()
    except (OSError, SystemExit) as e:
        print(f"[API] ERROR: Could not start API server — {e}")
        print(f"[API] Is port {API_PORT} already in use? Set API_PORT=<other> in .env to change it.")


async def main():
    await asyncio.gather(run_bot(), run_api())


if __name__ == "__main__":
    asyncio.run(main())
