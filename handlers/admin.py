# handlers/admin.py
from aiogram import Router, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from sqlalchemy import select

from config import ADMINS
from db.session import SessionLocal
from db.models import Booking, User
from states.admin import BroadcastState

router = Router()


def is_admin(user_id: int) -> bool:
    return user_id in ADMINS


# =========================
# ADMIN PANEL
# =========================
@router.message(Command("admin"))
async def admin_panel(message: types.Message):
    if not is_admin(message.from_user.id):
        return await message.answer("❌ You are not authorized as admin.")

    await message.answer(
        "👑 Admin Panel:\n"
        "/bookings - view bookings\n"
        "/broadcast - send message\n"
        "/stats - statistics"
    )


# =========================
# VIEW BOOKINGS
# =========================
@router.message(Command("bookings"))
async def view_bookings(message: types.Message):
    if not is_admin(message.from_user.id):
        return await message.answer("❌ You are not authorized as admin.")

    async with SessionLocal() as session:
        result = await session.execute(select(Booking))
        bookings = result.scalars().all()

    if not bookings:
        await message.answer("No bookings.")
        return

    text = ""
    for b in bookings:
        text += f"{b.id} | {b.date} {b.time} | {b.status}\n"

    await message.answer(text)


# =========================
# BROADCAST
# =========================
@router.message(Command("broadcast"))
async def broadcast_start(message: types.Message, state: FSMContext):
    if not is_admin(message.from_user.id):
        return await message.answer("❌ You are not authorized as admin.")

    await state.set_state(BroadcastState.message)
    await message.answer("📢 Send the message to broadcast to all users:")


@router.message(BroadcastState.message)
async def send_broadcast(message: types.Message, state: FSMContext):
    if not is_admin(message.from_user.id):
        return await message.answer("❌ You are not authorized as admin.")

    async with SessionLocal() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()

    sent_count = 0
    for user in users:
        try:
            await message.bot.send_message(user.telegram_id, message.text)
            sent_count += 1
        except Exception:
            pass

    await message.answer(f"✅ Broadcast sent to {sent_count} users.")
    await state.clear()


# =========================
# STATS
# =========================
@router.message(Command("stats"))
async def stats(message: types.Message):
    if not is_admin(message.from_user.id):
        return await message.answer("❌ You are not authorized as admin.")

    async with SessionLocal() as session:
        users = (await session.execute(select(User))).scalars().all()
        bookings = (await session.execute(select(Booking))).scalars().all()

    await message.answer(
        f"📊 Stats:\nUsers: {len(users)}\nBookings: {len(bookings)}"
    )