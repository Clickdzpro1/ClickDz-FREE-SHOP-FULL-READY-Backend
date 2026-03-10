# ClickDz FREE SHOP Backend

A production-ready, open-source e-commerce backend built specifically for the **Algerian market**. Clone it, run `docker compose up`, and you have a fully functional shop with all 58 wilayas, 5 payment gateways, 4 courier integrations, multi-vendor marketplace, and a complete admin API with **22+ features**.

> **Interactive API Docs**: Once running, visit `/api/docs` for full Swagger/OpenAPI documentation.

## Features

### Core Commerce
- **Algeria-Ready**: All 58 wilayas + 1541 communes, DZD currency, Algerian phone format
- **5 Payment Gateways**: Chargily (EDAHABIA/CIB), SlickPay, Stripe, CCP/BaridiMob, Cash on Delivery
- **4 Shipping Providers**: Yalidine, ZR Express, EMS Poste Algerie, Maystro + Manual
- **Full Auth System**: JWT with refresh token rotation, role-based access (Customer/Admin/Super Admin)
- **Product Catalog**: Categories with tree structure, variants, images, search & filtering
- **Order Management**: Full lifecycle (9 statuses), stock management, coupon system
- **Admin Dashboard**: Revenue stats, customer management, order export (CSV), shipping rate management
- **Trilingual**: Arabic, French, English on products and categories
- **Review System**: Customer reviews with admin moderation

### Extended Features (22+)
- **Wishlist**: Save products for later with add/remove/check/clear
- **Notifications**: In-app notification system with mark-as-read
- **Stock Alerts**: Subscribe to back-in-stock notifications
- **Two-Factor Authentication (2FA)**: TOTP-based with QR code setup and backup codes
- **Swagger/OpenAPI**: Interactive API docs at `/api/docs` with 28 endpoint groups
- **Social Login**: Link/unlink social accounts (Google, Facebook, etc.)
- **Product Recommendations**: "Also bought", similar products, personalized suggestions
- **Returns & RMA**: Full return request lifecycle with admin management
- **Gift Cards**: Purchase, redeem, check balance, transaction history
- **Loyalty Program**: Points system with tier progression (Bronze/Silver/Gold/Platinum)
- **Bulk Operations**: Mass update prices, stock, order statuses; product import
- **Product Bundles**: Discounted product bundles with CRUD
- **Newsletter**: Email subscription management with stats and CSV export
- **Subscriptions**: Recurring order subscriptions (weekly/biweekly/monthly/quarterly/yearly)
- **Multi-Vendor Marketplace**: Vendor applications, store profiles, commission management
- **Full-Text Search**: Trilingual search across products with autocomplete suggestions
- **Redis Caching**: High-performance caching layer with configurable TTL
- **Audit Logs**: Complete activity trail for admin actions
- **Webhook System**: Outgoing webhooks with HMAC signatures and delivery tracking
- **Audit Log Middleware**: Non-blocking fire-and-forget action logging
- **Docker Ready**: One command to run the entire stack

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ / TypeScript |
| Framework | Express.js |
| Database | PostgreSQL 16 + Prisma ORM |
| Cache | Redis 7 |
| Auth | JWT (access + refresh tokens) |
| Validation | Zod |
| API Docs | Swagger/OpenAPI 3.0 |
| 2FA | TOTP (otplib) |
| Container | Docker + Docker Compose |
| Package Manager | pnpm |

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Clickdzpro1/ClickDz-FREE-SHOP-FULL-READY-Backend.git
cd ClickDz-FREE-SHOP-FULL-READY-Backend

# Copy environment file
cp .env.example .env

# Start everything
docker compose up -d

# The API is now running at http://localhost:3000
# Health check: http://localhost:3000/health
# API base: http://localhost:3000/api/v1
# Swagger docs: http://localhost:3000/api/docs
```

### Option 2: Local Development

```bash
# Prerequisites: Node.js 20+, PostgreSQL 16, Redis 7

# Install dependencies
pnpm install

# Start database & Redis (Docker)
docker compose -f docker-compose.dev.yml up -d

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations & seed
npx prisma migrate dev
npx prisma db seed

# Start dev server
pnpm dev
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new customer |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/profile` | Get profile |
| PATCH | `/api/v1/auth/profile` | Update profile |

### Geography
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/geo/wilayas` | List all 58 wilayas |
| GET | `/api/v1/geo/wilayas/:id` | Wilaya detail with communes |
| GET | `/api/v1/geo/wilayas/:id/communes` | Communes by wilaya |
| GET | `/api/v1/geo/communes/search` | Search communes |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products (search, filter, paginate) |
| GET | `/api/v1/products/featured` | Featured products |
| GET | `/api/v1/products/:slug` | Product detail |
| POST | `/api/v1/products` | Create product (Admin) |
| PUT | `/api/v1/products/:id` | Update product (Admin) |
| DELETE | `/api/v1/products/:id` | Delete product (Admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | Root categories with children |
| GET | `/api/v1/categories/tree` | Full category tree |
| GET | `/api/v1/categories/:slug` | Category with products |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cart` | Get my cart |
| POST | `/api/v1/cart/items` | Add item to cart |
| PATCH | `/api/v1/cart/items/:id` | Update quantity |
| DELETE | `/api/v1/cart/items/:id` | Remove item |
| DELETE | `/api/v1/cart` | Clear cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/orders` | Place order (from cart) |
| GET | `/api/v1/orders/my` | My orders |
| GET | `/api/v1/orders/my/:id` | Order detail |
| POST | `/api/v1/orders/my/:id/cancel` | Cancel order |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/checkout/:orderId` | Initiate payment |
| GET | `/api/v1/payments/status/:orderId` | Payment status |
| POST | `/api/v1/payments/webhooks/chargily` | Chargily webhook |
| POST | `/api/v1/payments/webhooks/slickpay` | SlickPay webhook |
| POST | `/api/v1/payments/webhooks/stripe` | Stripe webhook |

### Shipping
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/shipping/providers` | List shipping providers |
| GET | `/api/v1/shipping/rates/:wilayaCode` | Get rates for wilaya |
| GET | `/api/v1/shipping/track/:orderId` | Track shipment |

### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wishlist` | Get my wishlist |
| POST | `/api/v1/wishlist/items` | Add item |
| DELETE | `/api/v1/wishlist/items/:productId` | Remove item |
| DELETE | `/api/v1/wishlist` | Clear wishlist |
| GET | `/api/v1/wishlist/check/:productId` | Check if item in wishlist |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Full-text product search |
| GET | `/api/v1/search/suggest` | Autocomplete suggestions |
| GET | `/api/v1/search/categories` | Search categories |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/recommendations/also-bought/:productId` | Frequently bought together |
| GET | `/api/v1/recommendations/similar/:productId` | Similar products |
| GET | `/api/v1/recommendations/personalized` | Personalized for user |

### Gift Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/gift-cards` | Purchase gift card |
| POST | `/api/v1/gift-cards/redeem` | Redeem gift card |
| GET | `/api/v1/gift-cards/balance/:code` | Check balance |
| GET | `/api/v1/gift-cards/my` | My gift cards |

### Loyalty Program
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/loyalty/balance` | Points balance & tier |
| POST | `/api/v1/loyalty/redeem` | Redeem points |
| GET | `/api/v1/loyalty/history` | Transaction history |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/subscriptions` | Create subscription |
| GET | `/api/v1/subscriptions` | My subscriptions |
| POST | `/api/v1/subscriptions/:id/pause` | Pause |
| POST | `/api/v1/subscriptions/:id/resume` | Resume |
| POST | `/api/v1/subscriptions/:id/cancel` | Cancel |

### Returns
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/returns` | Create return request |
| GET | `/api/v1/returns` | My returns |
| GET | `/api/v1/returns/:id` | Return detail |

### Vendors (Multi-Vendor Marketplace)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/vendors/apply` | Apply as vendor |
| GET | `/api/v1/vendors/stores` | List public stores |
| GET | `/api/v1/vendors/stores/:slug` | Store detail |
| GET | `/api/v1/vendors/me` | My vendor profile |

### Two-Factor Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/2fa/setup` | Generate 2FA secret + QR |
| POST | `/api/v1/2fa/verify` | Verify & enable 2FA |
| POST | `/api/v1/2fa/disable` | Disable 2FA |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Get notifications |
| PATCH | `/api/v1/notifications/:id/read` | Mark as read |
| POST | `/api/v1/notifications/read-all` | Mark all read |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/webhooks` | Create webhook endpoint |
| GET | `/api/v1/webhooks` | List endpoints |
| PATCH | `/api/v1/webhooks/:id` | Update endpoint |
| DELETE | `/api/v1/webhooks/:id` | Delete endpoint |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Dashboard statistics |
| GET | `/api/v1/admin/customers` | List customers |
| GET | `/api/v1/admin/customers/:id` | Customer detail |
| GET | `/api/v1/admin/orders/export` | Export orders (CSV) |
| GET | `/api/v1/orders` | All orders (filtered) |
| PATCH | `/api/v1/orders/:id/status` | Update order status |
| POST | `/api/v1/payments/confirm/:orderId` | Confirm manual payment |
| POST | `/api/v1/payments/reject/:orderId` | Reject manual payment |
| POST | `/api/v1/shipping/shipments/:orderId` | Create shipment |
| POST | `/api/v1/admin/bulk/products/prices` | Bulk update prices |
| POST | `/api/v1/admin/bulk/products/stock` | Bulk update stock |
| POST | `/api/v1/admin/bulk/products/import` | Bulk import products |
| POST | `/api/v1/admin/bulk/orders/status` | Bulk update order status |
| GET | `/api/v1/admin/audit-logs` | View audit logs |

## Payment Gateways

| Gateway | Methods | Type |
|---------|---------|------|
| **Chargily** | EDAHABIA, CIB | API + Webhook |
| **SlickPay** | EDAHABIA, CIB | API + Webhook |
| **Stripe** | International Cards | API + Webhook |
| **CCP/BaridiMob** | Manual Transfer | Admin Confirms |
| **COD** | Cash on Delivery | Collected on Delivery |

To add a new payment gateway, create a class implementing `IPaymentGateway` in `src/services/payment/gateways/` and register it in `payment.factory.ts`.

## Shipping Providers

| Provider | Type |
|----------|------|
| **Yalidine** | API Integration |
| **ZR Express** | API Integration |
| **EMS Poste** | API Integration |
| **Maystro** | API Integration |
| **Manual** | DB-based rates |

To add a new shipping provider, create a class implementing `IShippingProvider` in `src/services/shipping/providers/` and register it in `shipping.factory.ts`.

## Project Structure

```
src/
├── config/          # Environment, database, Redis, logger, Swagger
├── controllers/     # Request handlers (31 controller files)
├── middleware/       # Auth, validation, rate limiting, uploads, audit log
├── routes/          # Express route definitions (31 route files)
├── schemas/         # Zod validation schemas (20 schema files)
├── services/        # Business logic (30+ service files)
│   ├── payment/     # Payment gateway system
│   │   ├── gateways/    # Chargily, SlickPay, Stripe, CCP, COD
│   │   ├── payment.interface.ts
│   │   ├── payment.factory.ts
│   │   └── payment.service.ts
│   ├── shipping/    # Shipping provider system
│   │   ├── providers/   # Yalidine, ZR Express, EMS, Maystro, Manual
│   │   ├── shipping.interface.ts
│   │   ├── shipping.factory.ts
│   │   └── shipping.service.ts
│   ├── wishlist.service.ts
│   ├── notification.service.ts
│   ├── giftCard.service.ts
│   ├── loyalty.service.ts
│   ├── subscription.service.ts
│   ├── vendor.service.ts
│   ├── webhook.service.ts
│   ├── search.service.ts
│   ├── cache.service.ts
│   ├── auditLog.service.ts
│   ├── bulk.service.ts
│   └── ... (and more)
├── types/           # TypeScript type definitions
├── utils/           # Helpers (JWT, pagination, phone format, etc.)
├── app.ts           # Express app assembly
└── server.ts        # Server entry point
prisma/
├── schema.prisma    # Database schema (35+ models)
└── seed/            # Seed data (wilayas, communes, products, admin)
```

## Default Admin Account

After seeding:
- **Email**: admin@clickdz.com
- **Password**: ChangeMe123!

Change these in your `.env` file before production.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built for Algeria. Open for everyone.
