from sqlalchemy import select
from db.models import Booking
from config import TIME_SLOTS, MAX_PER_SLOT

month_prefix = lambda year, month: f"{year}-{str(month).zfill(2)}"

async def get_day_status(session, year, month):
    prefix = month_prefix(year, month)
    result = await session.execute(
        select(Booking).where(Booking.date.like(f"{prefix}-%"))
    )
    bookings = result.scalars().all()

    day_map = {}

    for b in bookings:
        d = int(b.date.split("-")[2])
        day_map.setdefault(d, 0)
        day_map[d] += 1

    # Convert to status
    for day in day_map:
        if day_map[day] >= len(TIME_SLOTS) * MAX_PER_SLOT:
            day_map[day] = -1  # fully booked

    return day_map


async def get_available_slots(session, date):
    result = await session.execute(
        select(Booking).where(Booking.date == date)
    )
    bookings = result.scalars().all()

    slot_count = {slot: 0 for slot in TIME_SLOTS}

    for b in bookings:
        slot_count[b.time] += 1

    available = [
        slot for slot, count in slot_count.items()
        if count < MAX_PER_SLOT
    ]

    return available