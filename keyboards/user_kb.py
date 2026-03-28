# keyboards/user_kb.py
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
from middlewares.i18n import _

def main_menu():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📅 " + _("Book Appointment"))],
            [KeyboardButton(text="❓ " + _("Ask Question"))],
            [KeyboardButton(text="👤 " + _("Profile"))],
        ],
        resize_keyboard=True
    )

def language_kb():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🇺🇿 UZ"), KeyboardButton(text="🇷🇺 RU"), KeyboardButton(text="🇬🇧 EN")]
        ],
        resize_keyboard=True
    )