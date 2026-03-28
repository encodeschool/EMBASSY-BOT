import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routes import auth, bookings, questions, broadcast, stats

app = FastAPI(title="HelpBot Admin API", docs_url="/api/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://embassy.encode.uz",
        "http://embassy.encode.uz",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",      tags=["auth"])
app.include_router(bookings.router,  prefix="/api/bookings",  tags=["bookings"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(broadcast.router, prefix="/api/broadcast", tags=["broadcast"])
app.include_router(stats.router,     prefix="/api/stats",     tags=["stats"])

# Serve the compiled React build in production
_build_dir = os.path.join(os.path.dirname(__file__), "../admin_web/dist")
if os.path.isdir(_build_dir):
    app.mount("/", StaticFiles(directory=_build_dir, html=True), name="spa")
