# API Reference

Base URL: `/api/v1`

All responses follow the envelope format:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | - | Register new customer |
| POST | `/auth/login` | - | Login, returns JWT tokens |
| POST | `/auth/refresh` | - | Refresh access token |
| POST | `/auth/logout` | - | Logout (invalidate refresh token) |
| POST | `/auth/logout-all` | JWT | Logout all sessions |
| GET | `/auth/profile` | JWT | Get current user profile |
| PUT | `/auth/profile` | JWT | Update profile |
| PUT | `/auth/change-password` | JWT | Change password |
| POST | `/auth/forgot-password` | - | Request password reset email |
| POST | `/auth/reset-password` | - | Reset password with token |

## Geography

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/geo/wilayas` | - | List all 58 wilayas |
| GET | `/geo/wilayas/:id/communes` | - | List communes for a wilaya |
| GET | `/geo/communes/search?q=` | - | Search communes by name |

## Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | - | List products (paginated, filterable) |
| GET | `/products/:idOrSlug` | - | Get product detail |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Soft-delete product |
| POST | `/products/:id/images` | Admin | Upload product images |
| DELETE | `/products/:id/images/:imageId` | Admin | Delete product image |

### Product Query Parameters
- `page`, `limit` — Pagination
- `sortBy`, `sortOrder` — Sorting
- `category` — Filter by category slug
- `minPrice`, `maxPrice` — Price range
- `search` — Full-text search (name, description)
- `lang` — Language (en, fr, ar)

## Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | - | List all categories (tree) |
| GET | `/categories/:idOrSlug` | - | Get category detail |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

## Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | JWT | Get current cart |
| POST | `/cart/items` | JWT | Add item to cart |
| PUT | `/cart/items/:itemId` | JWT | Update item quantity |
| DELETE | `/cart/items/:itemId` | JWT | Remove item from cart |
| DELETE | `/cart` | JWT | Clear entire cart |

## Addresses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/addresses` | JWT | List user addresses |
| POST | `/addresses` | JWT | Create address |
| PUT | `/addresses/:id` | JWT | Update address |
| DELETE | `/addresses/:id` | JWT | Delete address |
| PATCH | `/addresses/:id/default` | JWT | Set as default address |

## Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | JWT | Place order (from cart) |
| GET | `/orders` | JWT | List my orders |
| GET | `/orders/:id` | JWT | Get order detail |
| POST | `/orders/:id/cancel` | JWT | Cancel order |

## Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/:orderId/initiate` | JWT | Initiate payment |
| GET | `/payments/:orderId/status` | JWT | Check payment status |
| POST | `/payments/:orderId/confirm` | Admin | Confirm manual payment (CCP) |
| POST | `/payments/:orderId/reject` | Admin | Reject manual payment |
| POST | `/payments/:orderId/refund` | Admin | Refund payment |
| POST | `/payments/webhooks/chargily` | - | Chargily webhook |
| POST | `/payments/webhooks/slickpay` | - | SlickPay webhook |
| POST | `/payments/webhooks/stripe` | - | Stripe webhook |

## Shipping

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/shipping/rates?wilayaCode=` | - | Get shipping rates |
| GET | `/shipping/providers` | - | List shipping providers |
| POST | `/shipping/:orderId/ship` | Admin | Create shipment |
| GET | `/shipping/:orderId/track` | JWT | Track shipment |
| POST | `/shipping/:orderId/cancel` | Admin | Cancel shipment |
| GET | `/shipping/:orderId/label` | Admin | Get shipping label |

## Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews/product/:productId` | - | List reviews for product |
| POST | `/reviews` | JWT | Submit a review |
| PUT | `/reviews/:id` | JWT | Update own review |
| DELETE | `/reviews/:id` | JWT | Delete own review |
| PATCH | `/reviews/:id/approve` | Admin | Approve review |

## Coupons

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/coupons/validate` | JWT | Validate coupon code |
| GET | `/coupons` | Admin | List all coupons |
| POST | `/coupons` | Admin | Create coupon |
| PUT | `/coupons/:id` | Admin | Update coupon |
| DELETE | `/coupons/:id` | Admin | Delete coupon |

## Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard statistics |
| GET | `/admin/orders` | Admin | List all orders (filtered) |
| PUT | `/admin/orders/:id/status` | Admin | Update order status |
| GET | `/admin/customers` | Admin | List customers |
| GET | `/admin/customers/:id` | Admin | Customer detail |
| GET | `/admin/orders/export/csv` | Admin | Export orders CSV |
| GET | `/admin/shipping-rates` | Admin | List shipping rates |
| POST | `/admin/shipping-rates` | Admin | Upsert shipping rate |
| DELETE | `/admin/shipping-rates/:id` | Admin | Delete shipping rate |
| GET | `/admin/settings` | Admin | Get store settings |
| PUT | `/admin/settings` | Admin | Update store settings |

## Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | - | Server health check |
