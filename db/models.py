from sqlalchemy.orm import declarative_base
import datetime
from sqlalchemy import Column, Integer, BigInteger, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False)  # <- 64-bit Telegram IDs
    full_name = Column(String)
    language = Column(String)
    created_at = Column(DateTime(timezone=False), default=func.now())


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    date = Column(String)
    time = Column(String)
    status = Column(String, default="pending")


class QuestionLog(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)