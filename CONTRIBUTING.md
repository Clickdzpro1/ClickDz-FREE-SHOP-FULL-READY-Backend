# Contributing to ClickDz FREE SHOP Backend

Thank you for your interest in contributing! Here's how to get started.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ClickDz-FREE-SHOP-Backend.git`
3. Install dependencies: `pnpm install`
4. Start dev services: `docker compose -f docker-compose.dev.yml up -d`
5. Copy env: `cp .env.example .env`
6. Run migrations: `npx prisma migrate dev`
7. Seed the database: `npx prisma db seed`
8. Start the dev server: `pnpm dev`

## Adding a Payment Gateway

1. Create a new file in `src/services/payment/gateways/` implementing `IPaymentGateway`
2. Add the enum value to `PaymentMethod` in `prisma/schema.prisma`
3. Register it in `src/services/payment/payment.factory.ts`
4. Add config keys to `src/config/index.ts`
5. Add webhook route if needed in `src/routes/payment.routes.ts`
6. Document credentials in `.env.example`

## Adding a Shipping Provider

1. Create a new file in `src/services/shipping/providers/` implementing `IShippingProvider`
2. Add the enum value to `ShippingProvider` in `prisma/schema.prisma`
3. Register it in `src/services/shipping/shipping.factory.ts`
4. Add config keys to `src/config/index.ts`
5. Document credentials in `.env.example`

## Pull Request Guidelines

- Create a feature branch from `main`
- Write clear commit messages
- Ensure the code compiles: `pnpm build`
- Test your changes locally
- Update documentation if adding new features

## Code Style

- TypeScript strict mode
- Use Zod for all input validation
- Follow the existing patterns for services/controllers/routes
- Use `AppError` for throwing HTTP errors
- Use `asyncHandler` for all route handlers

## Reporting Issues

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS)
