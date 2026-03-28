#!/bin/bash
# One-time server setup script for embassybot on VDS
# Run as root: bash setup.sh

set -e

REPO_URL="https://github.com/encodeschool/EMBASSY-BOT.git"
APP_DIR="/opt/embassybot"
DOMAIN="embassy.encode.uz"

echo "==> Installing system packages..."
apt-get update -qq
apt-get install -y python3 python3-venv python3-pip nginx certbot python3-certbot-nginx git postgresql postgresql-contrib

echo "==> Cloning repository into $APP_DIR..."
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

echo "==> Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo "==> Creating .env file (fill in your values)..."
cat > "$APP_DIR/.env" << 'EOF'
BOT_TOKEN=YOUR_BOT_TOKEN_HERE
DB_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/embassy_bot
BOT_USERNAME=uzembassylv_bot
JWT_SECRET=CHANGE_THIS_TO_A_RANDOM_STRING
ADMIN_PANEL_URL=https://embassy.encode.uz
API_PORT=8000
EOF
echo "    ⚠️  Edit $APP_DIR/.env and fill in your real values before continuing!"
read -p "    Press Enter once you've filled in .env..."

echo "==> Setting up systemd service..."
cp "$APP_DIR/deploy/helpbot.service" /etc/systemd/system/helpbot.service
systemctl daemon-reload
systemctl enable helpbot

echo "==> Setting up nginx..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/embassybot
ln -sf /etc/nginx/sites-available/embassybot /etc/nginx/sites-enabled/embassybot
rm -f /etc/nginx/sites-enabled/default
nginx -t

echo "==> Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@encode.uz

echo "==> Starting services..."
systemctl start helpbot
systemctl reload nginx

echo ""
echo "✅ Setup complete!"
echo "   Bot + API:  systemctl status helpbot"
echo "   Logs:       journalctl -u helpbot -f"
echo "   Panel:      https://$DOMAIN"
