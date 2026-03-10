# ClickDz FREE SHOP Backend

A production-ready, open-source e-commerce backend built specifically for the **Algerian market**. Clone it, run `docker compose up`, and you have a fully functional shop with all 58 wilayas, 5 payment gateways, 4 courier integrations, and a complete admin API.

## Features

- **Algeria-Ready**: All 58 wilayas + communes, DZD currency, Algerian phone format
- **5 Payment Gateways**: Chargily (EDAHABIA/CIB), SlickPay, Stripe, CCP/BaridiMob, Cash on Delivery
- **4 Shipping Providers**: Yalidine, ZR Express, EMS Poste Algerie, Maystro + Manual
- **Full Auth System**: JWT with refresh token rotation, role-based access (Customer/Admin/Super Admin)
- **Product Catalog**: Categories with tree structure, variants, images, search & filtering
- **Order Management**: Full lifecycle (9 statuses), stock management, coupon system
- **Admin Dashboard**: Revenue stats, customer management, order export (CSV), shipping rate management
- **Trilingual**: Arabic, French, English on products and categories
- **Review System**: Customer reviews with admin moderation
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
| Container | Docker + Docker Compose |
| Package Manager | pnpm |

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/ClickDz-FREE-SHOP-Backend.git
cd ClickDz-FREE-SHOP-Backend

# Copy environment file
cp .env.example .env

# Start everything
docker compose up -d

# The API is now running at http://localhost:3000
# Health check: http://localhost:3000/health
# API base: http://localhost:3000/api/v1
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
├── config/          # Environment, database, Redis, logger
├── controllers/     # Request handlers
├── middleware/       # Auth, validation, rate limiting, uploads
├── routes/          # Express route definitions
├── schemas/         # Zod validation schemas
├── services/        # Business logic
│   ├── payment/     # Payment gateway system
│   │   ├── gateways/    # Chargily, SlickPay, Stripe, CCP, COD
│   │   ├── payment.interface.ts
│   │   ├── payment.factory.ts
│   │   └── payment.service.ts
│   └── shipping/    # Shipping provider system
│       ├── providers/   # Yalidine, ZR Express, EMS, Maystro, Manual
│       ├── shipping.interface.ts
│       ├── shipping.factory.ts
│       └── shipping.service.ts
├── types/           # TypeScript type definitions
├── utils/           # Helpers (JWT, pagination, phone format, etc.)
├── app.ts           # Express app assembly
└── server.ts        # Server entry point
prisma/
├── schema.prisma    # Database schema (17 models)
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
