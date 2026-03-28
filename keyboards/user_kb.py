# keyboards/user_kb.py
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

def main_menu():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📅 Book Appointment")],
            [KeyboardButton(text="❓ Ask Question")],
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