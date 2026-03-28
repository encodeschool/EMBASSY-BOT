# states/question.py
from aiogram.fsm.state import StatesGroup, State

class QuestionState(StatesGroup):
    waiting_for_text = State()