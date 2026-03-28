from sqlalchemy.orm import declarative_base, relationship
import datetime
from sqlalchemy import Column, Integer, BigInteger, String, DateTime, Text, ForeignKey, func


Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False)
    full_name = Column(String)
    language = Column(String)
    created_at = Column(DateTime(timezone=False), default=func.now())

    questions = relationship("QuestionLog", back_populates="user")


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
    user_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text)
    answer = Column(Text, nullable=True)
    user = relationship("User", back_populates="questions")