# states/admin.py
from aiogram.fsm.state import StatesGroup, State

class BroadcastState(StatesGroup):
    message = State()

class ReplyQuestionState(StatesGroup):
    message = State()  # The admin reply text