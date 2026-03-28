# states/booking.py
from aiogram.fsm.state import StatesGroup, State

class BookingState(StatesGroup):
    choosing_date = State()
    choosing_time = State()