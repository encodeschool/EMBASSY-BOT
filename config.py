from dotenv import load_dotenv
import os

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
DB_URL = os.getenv("DB_URL")

# ADMINS = [8064548424]  # Telegram IDs
ADMINS = []
TIME_SLOTS = [
    "09:00", "10:00", "11:00",
    "14:00", "15:00", "16:00"
]

MAX_PER_SLOT = 3  # max users per time slot