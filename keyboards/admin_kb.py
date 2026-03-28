# keyboards/admin_kb.py
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

def admin_panel_kb():
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📋 View Bookings", callback_data="view_bookings")],
            [InlineKeyboardButton(text="📢 Broadcast", callback_data="broadcast")],
            [InlineKeyboardButton(text="📊 Stats", callback_data="stats")],
        ]
    )