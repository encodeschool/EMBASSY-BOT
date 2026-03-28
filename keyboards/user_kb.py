# keyboards/user_kb.py
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
from locales.translations import get_text


def main_menu(lang: str = "en") -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📅 " + get_text("btn_book", lang))],
            [KeyboardButton(text="❓ " + get_text("btn_question", lang))],
            [KeyboardButton(text="👤 " + get_text("btn_profile", lang))],
        ],
        resize_keyboard=True
    )


def language_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="🇺🇿 UZ"),
                KeyboardButton(text="🇷🇺 RU"),
                KeyboardButton(text="🇬🇧 EN"),
            ]
        ],
        resize_keyboard=True
    )
