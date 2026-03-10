# Deployment Guide

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/Clickdzpro1/ClickDz-FREE-SHOP-FULL-READY-Backend.git
cd ClickDz-FREE-SHOP-FULL-READY-Backend

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your values — at minimum set:
#   JWT_SECRET, JWT_REFRESH_SECRET, ADMIN_PASSWORD, DB_PASSWORD

# 3. Start everything
docker compose up -d

# 4. Verify it's running
curl http://localhost:3000/health
```

The entrypoint script automatically:
- Runs Prisma migrations
- Seeds the database (58 wilayas, 1541 communes, demo products)
- Starts the Node.js server

## Local Development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- Redis 7
- pnpm

```bash
# 1. Start database services
docker compose -f docker-compose.dev.yml up -d

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env

# 4. Run migrations
pnpm db:migrate

# 5. Seed database
pnpm db:seed

# 6. Start dev server (hot reload)
pnpm dev
```

## Production Checklist

### Required Environment Variables
- `NODE_ENV=production`
- `JWT_SECRET` — Generate with `openssl rand -hex 32`
- `JWT_REFRESH_SECRET` — Generate with `openssl rand -hex 32` (different from JWT_SECRET!)
- `ADMIN_PASSWORD` — Strong password for the admin account
- `DB_PASSWORD` — Strong database password
- `CORS_ORIGINS` — Your frontend domain(s), comma-separated

### Security
- [ ] Set strong JWT secrets (min 32 characters each)
- [ ] Set strong database password
- [ ] Set strong admin password
- [ ] Configure CORS_ORIGINS to your frontend domain only
- [ ] Place behind a reverse proxy (Nginx/Traefik) with HTTPS
- [ ] Don't expose PostgreSQL port (5432) to the internet
- [ ] Don't expose Redis port (6379) to the internet

### Payment Gateways
Configure the gateways you need:
- **Chargily** — Set `CHARGILY_API_KEY`, `CHARGILY_SECRET_KEY`, `CHARGILY_WEBHOOK_SECRET`
- **SlickPay** — Set `SLICKPAY_PUBLIC_KEY`, `SLICKPAY_PRIVATE_KEY`
- **Stripe** — Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **CCP/BaridiMob** — No config needed (manual confirmation by admin)
- **COD** — No config needed

### Shipping Providers
Configure the providers you need:
- **Yalidine** — Set `YALIDINE_API_ID`, `YALIDINE_API_TOKEN`
- **ZR Express** — Set `ZREXPRESS_API_TOKEN`
- **EMS** — Set `EMS_API_KEY`
- **Maystro** — Set `MAYSTRO_API_TOKEN`
- **Manual** — No config needed (uses admin-managed shipping rates)

### Email (SMTP)
Required for password reset functionality:
- Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

## Reverse Proxy (Nginx Example)

```nginx
server {
    listen 80;
    server_name api.yourstore.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourstore.com;

    ssl_certificate /etc/letsencrypt/live/api.yourstore.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourstore.com/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Backups

```bash
# Manual backup
docker exec clickdz-postgres pg_dump -U postgres clickdz > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i clickdz-postgres psql -U postgres clickdz < backup_20240101.sql
```

## Useful Commands

```bash
# View logs
docker compose logs -f app

# Run Prisma Studio (database browser)
pnpm db:studio

# Reset database (WARNING: deletes all data)
pnpm db:reset

# Export orders
curl -H "Authorization: Bearer <admin-token>" http://localhost:3000/api/v1/admin/orders/export/csv
```
