from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
import calendar
from datetime import datetime

def generate_calendar(year: int, month: int, booked_days: dict):
    kb = []

    # Header
    kb.append([
        InlineKeyboardButton(text=f"{calendar.month_name[month]} {year}", callback_data="ignore")
    ])

    # Week days
    kb.append([
        InlineKeyboardButton(text=d, callback_data="ignore")
        for d in ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
    ])

    month_calendar = calendar.monthcalendar(year, month)

    for week in month_calendar:
        row = []
        for day in week:
            if day == 0:
                row.append(InlineKeyboardButton(text=" ", callback_data="ignore"))
            else:
                status = booked_days.get(day, 0)

                if status == -1:
                    text = f"❌ {day}"
                elif status > 0:
                    text = f"⚠️ {day}"
                else:
                    text = f"✅ {day}"

                row.append(
                    InlineKeyboardButton(
                        text=text,
                        callback_data=f"date_{year}_{month}_{day}"
                    )
                )
        kb.append(row)

    return InlineKeyboardMarkup(inline_keyboard=kb)