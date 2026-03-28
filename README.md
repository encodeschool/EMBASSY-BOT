What was built

  Backend — FastAPI (api/)

  ┌─────────────────────────┬─────────────────────────────────────────────────────────┐
  │          File           │                         Purpose                         │
  ├─────────────────────────┼─────────────────────────────────────────────────────────┤
  │ api/main.py             │ FastAPI app, CORS, serves React build in production     │
  ├─────────────────────────┼─────────────────────────────────────────────────────────┤
  │ api/auth.py             │ Telegram HMAC-SHA256 verification + JWT create/decode   │
  ├─────────────────────────┼─────────────────────────────────────────────────────────┤
  │ api/dependencies.py     │ get_current_admin — protects every route                │
  ├─────────────────────────┼─────────────────────────────────────────────────────────┤
  │ api/routes/auth.py      │ POST /api/auth/login — verify Telegram data, return JWT │
  ├─────────────────────────┼─────────────────────────────────────────────────────────┤
  │ api/routes/bookings.py  │ GET /api/bookings, PATCH /api/bookings/{id}/status      │
  ├─────────────────────────┼─────────────────────────────────────────────────────────┤
  │ api/routes/questions.py │ GET /api/questions, POST /api/questions/{id}/reply      │
  ├─────────────────────────┼─────────────────────────────────────────────────────────┤
  │ api/routes/broadcast.py │ POST /api/broadcast                                     │
  ├─────────────────────────┼─────────────────────────────────────────────────────────┤
  │ api/routes/stats.py     │ GET /api/stats                                          │
  └─────────────────────────┴─────────────────────────────────────────────────────────┘

  Frontend — React + Tailwind (admin_web/)

  ┌──────────────┬───────────────────────────────────────────────────────────────────────────────────────┐
  │  Component   │                                       Features                                        │
  ├──────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
  │ AuthPage     │ Gradient login screen, Telegram Login Widget injection, error handling                │
  ├──────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
  │ AdminPage    │ Responsive layout, collapsible sidebar (mobile drawer), header with user badge        │
  ├──────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
  │ Sidebar      │ Navigation items, active state, sign-out button, mobile overlay                       │
  ├──────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
  │ StatsTab     │ Stat cards grid — users, bookings breakdown, questions breakdown                      │
  ├──────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
  │ BookingsTab  │ Filter by status, desktop table + mobile cards, inline approve/reject/pending buttons │
  ├──────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
  │ QuestionsTab │ Filter answered/unanswered, reply modal with preview, toast notifications             │
  ├──────────────┼───────────────────────────────────────────────────────────────────────────────────────┤
  │ BroadcastTab │ Textarea with char counter, message preview, result breakdown (sent/failed)           │
  └──────────────┴───────────────────────────────────────────────────────────────────────────────────────┘

  Updated files
  - app.py — runs bot + FastAPI together via asyncio.gather
  - config.py — added BOT_USERNAME
  - requirements.txt — added fastapi, uvicorn, PyJWT, httpx

  ---
  Setup steps

  # 1. Install new Python deps
  pip install -r requirements.txt

  # 2. Add to your .env
  BOT_USERNAME=YourBotUsername      # without @
  JWT_SECRET=some_random_secret     # optional, defaults to bot token hash

  # 3. Set up Telegram Login Widget domain
  # In BotFather: /setdomain → set to your domain (or localhost for dev)

  # 4. Install & run React
  cd admin_web
  cp .env.example .env              # edit VITE_BOT_USERNAME
  npm install
  npm run dev                       # http://localhost:5173

  # 5. Run the bot + API together
  cd ..
  python app.py                     # bot polls + API on :8000

  # 6. Production build (optional)
  cd admin_web && npm run build     # dist/ is served by FastAPI automatically