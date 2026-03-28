import html
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
from states.question import QuestionState
from locales.translations import all_variants, get_text

router = Router()

# Pre-compute button text sets for all languages — used by handler filters
BOOK_TEXTS = all_variants("btn_book", prefix="📅 ")
QUESTION_TEXTS = all_variants("btn_question", prefix="❓ ")
PROFILE_TEXTS = all_variants("btn_profile", prefix="👤 ")


# =========================
# START + LANGUAGE
# =========================
@router.message(Command("start"))
async def start(message: types.Message, state: FSMContext, _=lambda k, **kw: k):
    async with SessionLocal() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == message.from_user.id)
        )
        user = result.scalar()

        if not user:
            new_user = User(
                telegram_id=message.from_user.id,
                full_name=message.from_user.full_name,
                language="uz",
            )
            session.add(new_user)
            await session.commit()

    if message.from_user.id in ADMINS:
        await message.answer(
            "👑 Welcome Admin! Use the buttons below to manage the bot:",
            reply_markup=admin_panel_kb()
        )
    else:
        await message.answer(
            _("welcome_language"),
            reply_markup=language_kb()
        )


# =========================
# LANGUAGE SELECTION
# =========================
@router.message(lambda m: m.text in ["🇺🇿 UZ", "🇷🇺 RU", "🇬🇧 EN"])
async def set_language(message: types.Message):
    lang_map = {"UZ": "uz", "RU": "ru", "EN": "en"}
    lang = lang_map.get(message.text.split()[1], "uz")

    async with SessionLocal() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == message.from_user.id)
        )
        user = result.scalar()
        user.language = lang
        await session.commit()

    await message.answer(
        get_text("menu", lang),
        reply_markup=main_menu(lang)
    )


# =========================
# BOOKING - CALENDAR
# =========================
@router.message(lambda m: m.text in BOOK_TEXTS)
async def show_calendar(message: types.Message, _=lambda k, **kw: k, lang: str = "uz"):
    now = datetime.now()
    async with SessionLocal() as session:
        booked_days = await get_day_status(session, now.year, now.month)

    kb = generate_calendar(now.year, now.month, booked_days)
    await message.answer(_("select_date"), reply_markup=kb)


# =========================
# SELECT DATE
# =========================
@router.callback_query(lambda c: c.data.startswith("date_"))
async def select_date(callback: types.CallbackQuery, state: FSMContext, _=lambda k, **kw: k):
    # Use _cmd to avoid shadowing the translation function _
    _cmd, y, m, d = callback.data.split("_")
    date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"

    async with SessionLocal() as session:
        slots = await get_available_slots(session, date)

    if not slots:
        await callback.answer(_("day_fully_booked"), show_alert=True)
        return

    await callback.answer()

    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=s, callback_data=f"time_{date}_{s}")]
            for s in slots
        ]
    )

    await state.update_data(date=date)
    await callback.message.edit_text(
        _("selected_date_choose_time", date=date),
        reply_markup=kb
    )


# =========================
# SELECT TIME + SAVE
# =========================
@router.callback_query(lambda c: c.data.startswith("time_"))
async def select_time(
    callback: types.CallbackQuery,
    state: FSMContext,
    bot: Bot,
    _=lambda k, **kw: k,
    lang: str = "uz",
):
    # Use _cmd to avoid shadowing the translation function _
    _cmd, date, time = callback.data.split("_")

    async with SessionLocal() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == callback.from_user.id)
        )
        user = result.scalar()

        # Check if user already booked this slot
        duplicate = await session.execute(
            select(Booking).where(
                Booking.user_id == user.id,
                Booking.date == date,
                Booking.time == time,
            )
        )
        if duplicate.scalar():
            await callback.answer(_("already_booked_slot"), show_alert=True)
            return

        # Re-check slot availability
        result = await session.execute(
            select(Booking).where(Booking.date == date, Booking.time == time)
        )
        existing = result.scalars().all()

        if len(existing) >= MAX_PER_SLOT:
            await callback.answer(_("slot_just_full"), show_alert=True)
            return

        booking = Booking(user_id=user.id, date=date, time=time)
        session.add(booking)
        await session.commit()
        await callback.answer()

    # Notify admins (always in English — admin panel is English-only)
    for admin_id in ADMINS:
        try:
            await bot.send_message(
                admin_id,
                f"📅 New booking:\nDate: {date}\nTime: {time}\nUser: {callback.from_user.full_name}"
            )
        except Exception as e:
            print(f"Admin notify error: {e}")

    await callback.message.edit_text(_("booked_success", date=date, time=time))
    await state.clear()


# =========================
# QUESTIONS
# =========================
@router.message(lambda m: m.text in QUESTION_TEXTS)
async def ask_question(message: types.Message, state: FSMContext, _=lambda k, **kw: k):
    await state.set_state(QuestionState.waiting_for_text)
    await message.answer(_("ask_question_prompt"))


@router.message(QuestionState.waiting_for_text)
async def log_question(message: types.Message, state: FSMContext, _=lambda k, **kw: k):
    async with SessionLocal() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == message.from_user.id)
        )
        user = result.scalar()

        q = QuestionLog(user_id=user.id, text=message.text)
        session.add(q)
        await session.commit()

    await message.answer(_("question_received"))
    await state.clear()


# =========================
# PROFILE
# =========================
@router.message(lambda m: m.text in PROFILE_TEXTS)
async def user_profile(message: types.Message, _=lambda k, **kw: k, lang: str = "uz"):
    async with SessionLocal() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == message.from_user.id)
        )
        user = result.scalar()
        if not user:
            await message.answer(_("user_not_found"))
            return

        bookings = (
            await session.execute(select(Booking).where(Booking.user_id == user.id))
        ).scalars().all()

        questions = (
            await session.execute(select(QuestionLog).where(QuestionLog.user_id == user.id))
        ).scalars().all()

    status_map = {
        "pending": _("status_pending"),
        "approved": _("status_approved"),
        "rejected": _("status_rejected"),
    }
    status_emoji = {"pending": "⏳", "approved": "✅", "rejected": "❌"}

    # Use html.escape() on user-provided data to prevent HTML parse errors
    safe_name = html.escape(user.full_name or "—")
    lang_display = html.escape(user.language.upper() if user.language else "—")

    lines = [
        _("profile_header", name=safe_name),
        _("profile_language", code=lang_display),
        "",
        _("profile_bookings_title"),
    ]

    if bookings:
        for b in bookings:
            emoji = status_emoji.get(b.status, "❓")
            label = status_map.get(b.status, b.status.capitalize())
            lines.append(f"{emoji} {b.date} {b.time} — {label}")
    else:
        lines.append(_("profile_no_bookings"))

    lines.append("")
    lines.append(_("profile_questions_title"))

    if questions:
        for q in questions[-5:]:
            safe_q = html.escape(q.text or "")
            answer_raw = q.answer if q.answer else _("profile_not_answered")
            safe_a = html.escape(answer_raw)
            lines.append(f"- {safe_q}\n  ↪ {safe_a}")
    else:
        lines.append(_("profile_no_questions"))

    await message.answer("\n".join(lines), parse_mode="HTML")
