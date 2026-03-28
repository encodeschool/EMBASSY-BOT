from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

def admin_panel_kb():
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📋 View Bookings", callback_data="view_bookings")],
            [InlineKeyboardButton(text="❓ View Questions", callback_data="view_questions")],
            [InlineKeyboardButton(text="📢 Broadcast", callback_data="broadcast")],
            [InlineKeyboardButton(text="📊 Stats", callback_data="stats")],
        ]
    )

# Inline keyboard for changing booking status
def booking_status_kb(booking_id: int):
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Approve", callback_data=f"status_{booking_id}_approved"),
                InlineKeyboardButton(text="❌ Reject", callback_data=f"status_{booking_id}_rejected")
            ],
            [
                InlineKeyboardButton(text="⏳ Pending", callback_data=f"status_{booking_id}_pending")
            ]
        ]
    )