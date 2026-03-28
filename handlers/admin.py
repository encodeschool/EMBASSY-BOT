# handlers/admin.py
from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from sqlalchemy import select

from db.session import SessionLocal
from db.models import Booking, User
from states.admin import BroadcastState
from keyboards.admin_kb import admin_panel_kb
from config import ADMINS

router = Router()

def is_admin(user_id: int) -> bool:
    return user_id in ADMINS


@router.callback_query(F.data == "view_bookings")
async def callback_view_bookings(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        return await callback.message.answer("❌ Not authorized.")

    async with SessionLocal() as session:
        bookings = (await session.execute(select(Booking))).scalars().all()

    if not bookings:
        await callback.message.edit_text("No bookings yet.")
        return

    text = "📋 Bookings:\n\n"
    for b in bookings:
        text += f"{b.id} | {b.date} {b.time} | {b.status}\n"

    await callback.message.edit_text(text)


@router.callback_query(F.data == "stats")
async def callback_stats(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        return await callback.message.answer("❌ Not authorized.")

    async with SessionLocal() as session:
        users = (await session.execute(select(User))).scalars().all()
        bookings = (await session.execute(select(Booking))).scalars().all()

    await callback.message.edit_text(f"📊 Stats:\nUsers: {len(users)}\nBookings: {len(bookings)}")


@router.callback_query(F.data == "broadcast")
async def callback_broadcast(callback: types.CallbackQuery, state: FSMContext):
    if not is_admin(callback.from_user.id):
        return await callback.message.answer("❌ Not authorized.")

    await state.set_state(BroadcastState.message)
    await callback.message.edit_text("📢 Send the message to broadcast to all users:")


@router.message(BroadcastState.message)
async def send_broadcast(message: types.Message, state: FSMContext):
    if not is_admin(message.from_user.id):
        return await message.answer("❌ Not authorized.")

    async with SessionLocal() as session:
        users = (await session.execute(select(User))).scalars().all()

    sent_count = 0
    for user in users:
        try:
            await message.bot.send_message(user.telegram_id, message.text)
            sent_count += 1
        except Exception:
            pass

    await message.answer(f"✅ Broadcast sent to {sent_count} users.")
    await state.clear()