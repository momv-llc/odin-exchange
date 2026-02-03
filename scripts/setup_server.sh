#!/usr/bin/env bash
set -euo pipefail

FRONTEND_DOMAIN=${FRONTEND_DOMAIN:-ex.odineco.online}
API_DOMAIN=${API_DOMAIN:-api.odineco.online}
CERTBOT_EMAIL=${CERTBOT_EMAIL:-}

if [[ $EUID -ne 0 ]]; then
  SUDO="sudo"
else
  SUDO=""
fi

$SUDO apt-get update -y
$SUDO apt-get install -y ca-certificates curl gnupg lsb-release

if ! command -v docker >/dev/null 2>&1; then
  $SUDO install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  $SUDO chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
  $SUDO apt-get update -y
  $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  $SUDO systemctl enable --now docker
fi

$SUDO apt-get install -y nginx certbot python3-certbot-nginx

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example. Please update secrets before production run."
fi

NGINX_CONF="/etc/nginx/sites-available/odin-exchange.conf"
$SUDO tee "$NGINX_CONF" > /dev/null <<NGINX
server {
    listen 80;
    server_name ${FRONTEND_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

server {
    listen 80;
    server_name ${API_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

$SUDO ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/odin-exchange.conf
$SUDO rm -f /etc/nginx/sites-enabled/default
$SUDO nginx -t
$SUDO systemctl reload nginx

if [[ -n "$CERTBOT_EMAIL" ]]; then
  $SUDO certbot --nginx --non-interactive --agree-tos -m "$CERTBOT_EMAIL" -d "$FRONTEND_DOMAIN" -d "$API_DOMAIN"
  $SUDO systemctl reload nginx
else
  echo "Skipping Certbot (set CERTBOT_EMAIL to enable automatic TLS)."
fi

docker compose up -d --build

echo "Deployment finished."
