from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from sqlalchemy import select

from db.session import SessionLocal
from db.models import Booking, User
from states.admin import BroadcastState
from keyboards.admin_kb import admin_panel_kb, booking_status_kb
from config import ADMINS

router = Router()

# --- Admin check ---
def is_admin(user_id: int) -> bool:
    return user_id in ADMINS

# --- View bookings with status buttons ---
@router.callback_query(F.data == "view_bookings")
async def callback_view_bookings(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        return await callback.message.answer("❌ Not authorized.")

    async with SessionLocal() as session:
        bookings = (await session.execute(select(Booking))).scalars().all()

    if not bookings:
        await callback.message.edit_text("No bookings yet.")
        return

    # Send each booking as a separate message with status buttons
    for b in bookings:
        text = f"📋 Booking ID: {b.id}\nUser ID: {b.user_id}\nDate: {b.date} {b.time}\nStatus: {b.status}"
        await callback.message.answer(text, reply_markup=booking_status_kb(b.id))

    await callback.message.delete()  # optional: remove the original message

# --- Change booking status ---
@router.callback_query(F.data.startswith("status_"))
async def callback_change_status(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        return await callback.message.answer("❌ Not authorized.")

    # Parse callback_data: status_<booking_id>_<new_status>
    _, booking_id_str, new_status = callback.data.split("_")
    booking_id = int(booking_id_str)

    async with SessionLocal() as session:
        result = await session.execute(select(Booking).where(Booking.id == booking_id))
        booking = result.scalar()

        if not booking:
            await callback.message.edit_text("❌ Booking not found.")
            return

        booking.status = new_status
        await session.commit()

    # Optionally notify the user
    try:
        await callback.message.bot.send_message(
            booking.user_id,
            f"📌 Your booking on {booking.date} {booking.time} is now '{new_status}'."
        )
    except Exception:
        pass

    await callback.message.edit_text(f"✅ Booking status updated to '{new_status}'")

# --- Stats ---
@router.callback_query(F.data == "stats")
async def callback_stats(callback: types.CallbackQuery):
    if not is_admin(callback.from_user.id):
        return await callback.message.answer("❌ Not authorized.")

    async with SessionLocal() as session:
        users = (await session.execute(select(User))).scalars().all()
        bookings = (await session.execute(select(Booking))).scalars().all()

    await callback.message.edit_text(f"📊 Stats:\nUsers: {len(users)}\nBookings: {len(bookings)}")

# --- Broadcast ---
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