# handlers/user.py
from aiogram import Router, types, Bot
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from sqlalchemy import select
from datetime import datetime

from db.session import SessionLocal
from db.models import User, Booking, QuestionLog
from keyboards.user_kb import main_menu, language_kb
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from services.booking_service import get_day_status, get_available_slots
from keyboards.calendar_kb import generate_calendar
from config import ADMINS, MAX_PER_SLOT
from keyboards.admin_kb import admin_panel_kb
from keyboards.user_kb import main_menu, language_kb

router = Router()


# =========================
# START + LANGUAGE
# =========================
@router.message(Command("start"))
async def start(message: types.Message, state: FSMContext):
    # Save user in DB
    async with SessionLocal() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == message.from_user.id)
        )
        user = result.scalar()

        if not user:
            new_user = User(
                telegram_id=message.from_user.id,
                full_name=message.from_user.full_name
            )
            session.add(new_user)
            await session.commit()

    # Detect admin
    if message.from_user.id in ADMINS:
        await message.answer(
            "👑 Welcome Admin! Use the buttons below to manage the bot:",
            reply_markup=admin_panel_kb()
        )
    else:
        # Regular user flow: ask language first
        await message.answer("Welcome! Please select your language:", reply_markup=language_kb())


@router.message(lambda m: m.text in ["🇺🇿 UZ", "🇷🇺 RU", "🇬🇧 EN"])
async def set_language(message: types.Message):
    lang = message.text.split()[1]

    async with SessionLocal() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == message.from_user.id)
        )
        user = result.scalar()
        user.language = lang
        await session.commit()

    await message.answer("Menu:", reply_markup=main_menu())


# =========================
# BOOKING - CALENDAR
# =========================
@router.message(lambda m: m.text == "📅 Book Appointment")
async def show_calendar(message: types.Message):
    now = datetime.now()
    async with SessionLocal() as session:
        booked_days = await get_day_status(session, now.year, now.month)

    kb = generate_calendar(now.year, now.month, booked_days)
    await message.answer("📅 Select a date:", reply_markup=kb)


# =========================
# SELECT DATE
# =========================
@router.callback_query(lambda c: c.data.startswith("date_"))
async def select_date(callback: types.CallbackQuery, state: FSMContext):
    await callback.answer()
    _, y, m, d = callback.data.split("_")
    date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    async with SessionLocal() as session:
        slots = await get_available_slots(session, date)

    if not slots:
        await callback.answer("❌ This day is fully booked", show_alert=True)
        return

    kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text=s, callback_data=f"time_{date}_{s}")] for s in slots]
    )

    await state.update_data(date=date)
    await callback.message.edit_text(
        f"📅 Selected date: {date}\n\n⏰ Choose time:",
        reply_markup=kb
    )


# =========================
# SELECT TIME + SAVE
# =========================
@router.callback_query(lambda c: c.data.startswith("time_"))
async def select_time(callback: types.CallbackQuery, state: FSMContext, bot: Bot):
    await callback.answer()
    _, date, time = callback.data.split("_")

    async with SessionLocal() as session:
        # Re-check slot availability
        result = await session.execute(
            select(Booking).where(Booking.date == date, Booking.time == time)
        )
        existing = result.scalars().all()

        if len(existing) >= MAX_PER_SLOT:
            await callback.answer("⚠️ Slot just became full. Choose another.", show_alert=True)
            return

        result = await session.execute(
            select(User).where(User.telegram_id == callback.from_user.id)
        )
        user = result.scalar()

        booking = Booking(user_id=user.id, date=date, time=time)
        session.add(booking)
        await session.commit()

    # Notify admins
    for admin in ADMINS:
        try:
            await bot.send_message(
                admin,
                f"📅 New booking:\nDate: {date}\nTime: {time}\nUser: {callback.from_user.full_name}"
            )
        except Exception as e:
            print(f"Admin notify error: {e}")

    await callback.message.edit_text(
        f"✅ Booked successfully!\n\n📅 Date: {date}\n⏰ Time: {time}"
    )
    await state.clear()


# =========================
# QUESTIONS
# =========================
@router.message(lambda m: m.text == "❓ Ask Question")
async def ask(message: types.Message):
    await message.answer("✍️ Send your question:")


@router.message()
async def log_question(message: types.Message):
    async with SessionLocal() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == message.from_user.id)
        )
        user = result.scalar()

        q = QuestionLog(user_id=user.id, text=message.text)
        session.add(q)
        await session.commit()

    await message.answer("✅ Your question has been received.")