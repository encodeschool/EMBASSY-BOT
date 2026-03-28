TEXTS = {
    "en": {
        # Language selection
        "welcome_language": "Welcome! Please select your language:",

        # Main menu buttons
        "btn_book": "Book Appointment",
        "btn_question": "Ask Question",
        "btn_profile": "Profile",

        # Booking flow
        "select_date": "📅 Select a date:",
        "day_fully_booked": "❌ This day is fully booked",
        "selected_date_choose_time": "📅 Selected date: {date}\n\n⏰ Choose a time:",
        "slot_just_full": "⚠️ Slot just became full. Choose another time.",
        "already_booked_slot": "⚠️ You already have a booking for this slot.",
        "booked_success": "✅ Booked successfully!\n\n📅 Date: {date}\n⏰ Time: {time}",

        # Question flow
        "ask_question_prompt": "✍️ Please send your question:",
        "question_received": "✅ Your question has been received. Our staff will reply soon.",

        # Profile
        "user_not_found": "❌ User not found. Try /start",
        "profile_header": "👤 <b>Profile:</b> {name}",
        "profile_language": "🌐 Language: {code}",
        "profile_bookings_title": "📅 <b>Bookings:</b>",
        "profile_no_bookings": "- No bookings yet",
        "profile_questions_title": "❓ <b>Recent Questions:</b>",
        "profile_no_questions": "- No questions yet",
        "profile_not_answered": "❌ Not answered yet",

        # Booking status names (for profile display)
        "status_pending": "Pending",
        "status_approved": "Approved",
        "status_rejected": "Rejected",

        # Notifications sent to users
        "notify_booking_status": "📌 Your booking on {date} at {time} is now: {status}.",
        "notify_question_answered": "📌 Your question has been answered:\n❓ {question}\n✅ Answer: {answer}",

        # Menu label
        "menu": "Menu:",
    },

    "ru": {
        # Language selection
        "welcome_language": "Добро пожаловать! Пожалуйста, выберите язык:",

        # Main menu buttons
        "btn_book": "Записаться",
        "btn_question": "Задать вопрос",
        "btn_profile": "Профиль",

        # Booking flow
        "select_date": "📅 Выберите дату:",
        "day_fully_booked": "❌ Этот день полностью занят",
        "selected_date_choose_time": "📅 Выбранная дата: {date}\n\n⏰ Выберите время:",
        "slot_just_full": "⚠️ Это время только что стало недоступным. Выберите другое.",
        "already_booked_slot": "⚠️ У вас уже есть запись на это время.",
        "booked_success": "✅ Запись создана!\n\n📅 Дата: {date}\n⏰ Время: {time}",

        # Question flow
        "ask_question_prompt": "✍️ Пожалуйста, отправьте ваш вопрос:",
        "question_received": "✅ Ваш вопрос получен. Наши сотрудники скоро ответят.",

        # Profile
        "user_not_found": "❌ Пользователь не найден. Попробуйте /start",
        "profile_header": "👤 <b>Профиль:</b> {name}",
        "profile_language": "🌐 Язык: {code}",
        "profile_bookings_title": "📅 <b>Записи:</b>",
        "profile_no_bookings": "- Записей пока нет",
        "profile_questions_title": "❓ <b>Последние вопросы:</b>",
        "profile_no_questions": "- Вопросов пока нет",
        "profile_not_answered": "❌ Ещё не отвечено",

        # Booking status names
        "status_pending": "Ожидает",
        "status_approved": "Одобрено",
        "status_rejected": "Отклонено",

        # Notifications sent to users
        "notify_booking_status": "📌 Статус вашей записи на {date} в {time} изменён: {status}.",
        "notify_question_answered": "📌 На ваш вопрос ответили:\n❓ {question}\n✅ Ответ: {answer}",

        # Menu label
        "menu": "Меню:",
    },

    "uz": {
        # Language selection
        "welcome_language": "Xush kelibsiz! Iltimos, tilni tanlang:",

        # Main menu buttons
        "btn_book": "Uchrashuvga yozilish",
        "btn_question": "Savol berish",
        "btn_profile": "Profil",

        # Booking flow
        "select_date": "📅 Sanani tanlang:",
        "day_fully_booked": "❌ Bu kun to'liq band",
        "selected_date_choose_time": "📅 Tanlangan sana: {date}\n\n⏰ Vaqtni tanlang:",
        "slot_just_full": "⚠️ Bu vaqt hozirgina to'lib ketdi. Boshqa vaqtni tanlang.",
        "already_booked_slot": "⚠️ Siz allaqachon bu vaqtga yozilgansiz.",
        "booked_success": "✅ Muvaffaqiyatli yozildi!\n\n📅 Sana: {date}\n⏰ Vaqt: {time}",

        # Question flow
        "ask_question_prompt": "✍️ Iltimos, savolingizni yuboring:",
        "question_received": "✅ Savolingiz qabul qilindi. Xodimlarimiz tez orada javob beradi.",

        # Profile
        "user_not_found": "❌ Foydalanuvchi topilmadi. /start buyrug'ini sinab ko'ring",
        "profile_header": "👤 <b>Profil:</b> {name}",
        "profile_language": "🌐 Til: {code}",
        "profile_bookings_title": "📅 <b>Yozuvlar:</b>",
        "profile_no_bookings": "- Hali yozuvlar yo'q",
        "profile_questions_title": "❓ <b>So'nggi savollar:</b>",
        "profile_no_questions": "- Hali savollar yo'q",
        "profile_not_answered": "❌ Hali javob berilmagan",

        # Booking status names
        "status_pending": "Kutilmoqda",
        "status_approved": "Tasdiqlangan",
        "status_rejected": "Rad etilgan",

        # Notifications sent to users
        "notify_booking_status": "📌 {date} kuni {time} dagi yozuvingiz holati o'zgardi: {status}.",
        "notify_question_answered": "📌 Savolingizga javob berildi:\n❓ {question}\n✅ Javob: {answer}",

        # Menu label
        "menu": "Menyu:",
    },
}

SUPPORTED_LANGS = list(TEXTS.keys())


def get_text(key: str, lang: str, **kwargs) -> str:
    """Return translated string for key in given language, with optional format kwargs."""
    lang = lang.lower() if lang else "en"
    if lang not in TEXTS:
        lang = "en"
    text = TEXTS[lang].get(key) or TEXTS["en"].get(key, key)
    if kwargs:
        text = text.format(**kwargs)
    return text


def all_variants(key: str, prefix: str = "") -> set:
    """Return set of all translated variants of a key (optionally with a prefix).
    Used to build handler filters that work regardless of user language."""
    result = set()
    for lang in SUPPORTED_LANGS:
        value = TEXTS[lang].get(key, "")
        if value:
            result.add(prefix + value)
    return result
