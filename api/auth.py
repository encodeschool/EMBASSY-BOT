import hashlib
import hmac
import time
import os
import jwt
from config import BOT_TOKEN, ADMINS

# Derive a stable secret from the bot token
_raw_secret = os.getenv("JWT_SECRET") or BOT_TOKEN
SECRET_KEY = hashlib.sha256(_raw_secret.encode()).hexdigest()


def verify_telegram_auth(data: dict) -> bool:
    """Verify Telegram Login Widget HMAC-SHA256 signature."""
    check_hash = data.get("hash")
    if not check_hash:
        return False

    # Auth data must be fresh (max 24 hours old)
    try:
        if time.time() - int(data.get("auth_date", 0)) > 86400:
            return False
    except (ValueError, TypeError):
        return False

    fields = {k: v for k, v in data.items() if k != "hash"}
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(fields.items()))
    secret_key = hashlib.sha256(BOT_TOKEN.encode()).digest()
    computed = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, check_hash)


def is_admin(user_id: int) -> bool:
    return user_id in ADMINS


def create_token(user_id: int) -> str:
    from datetime import datetime, timedelta, timezone
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return int(payload["sub"])
    except Exception:
        return None
