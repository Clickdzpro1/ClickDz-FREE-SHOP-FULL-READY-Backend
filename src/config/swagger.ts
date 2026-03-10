import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ClickDz FREE SHOP API",
      version: "2.0.0",
      description:
        "Production-ready e-commerce API for the Algerian market. " +
        "Supports 58 wilayas, 5 payment gateways (Chargily, SlickPay, Stripe, CCP, COD), " +
        "4 shipping providers (Yalidine, ZR Express, EMS, Maystro), " +
        "multi-vendor marketplace, subscriptions, loyalty program, gift cards, and more.",
      contact: {
        name: "ClickDz Team",
        url: "https://github.com/Clickdzpro1/ClickDz-FREE-SHOP-FULL-READY-Backend",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      { url: "/api/v1", description: "API v1" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            message: { type: "string" },
          },
        },
        Paginated: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "array", items: {} },
            meta: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication & user management" },
      { name: "Geography", description: "Wilayas and communes" },
      { name: "Products", description: "Product catalog" },
      { name: "Categories", description: "Product categories" },
      { name: "Cart", description: "Shopping cart" },
      { name: "Orders", description: "Order management" },
      { name: "Payments", description: "Payment processing" },
      { name: "Shipping", description: "Shipping & tracking" },
      { name: "Reviews", description: "Product reviews" },
      { name: "Coupons", description: "Coupon management" },
      { name: "Wishlist", description: "User wishlists" },
      { name: "Notifications", description: "User notifications" },
      { name: "Stock Alerts", description: "Back-in-stock alerts" },
      { name: "2FA", description: "Two-factor authentication" },
      { name: "Recommendations", description: "Product recommendations" },
      { name: "Returns", description: "Returns & RMA" },
      { name: "Gift Cards", description: "Gift card management" },
      { name: "Loyalty", description: "Loyalty points program" },
      { name: "Newsletter", description: "Newsletter subscriptions" },
      { name: "Bundles", description: "Product bundles" },
      { name: "Subscriptions", description: "Recurring order subscriptions" },
      { name: "Vendors", description: "Multi-vendor marketplace" },
      { name: "Webhooks", description: "Webhook management" },
      { name: "Search", description: "Full-text search" },
      { name: "Bulk Operations", description: "Bulk admin operations" },
      { name: "Audit Logs", description: "Activity audit trail" },
      { name: "Social Login", description: "Social authentication" },
      { name: "Admin", description: "Admin dashboard & management" },
    ],
  },
  apis: [], // We define routes inline in swagger config, not in annotations
};

export const swaggerSpec = swaggerJsdoc(options) as Record<string, any>;

// Add path definitions programmatically for all route groups
swaggerSpec.paths = {
  // Auth
  "/auth/register": {
    post: { tags: ["Auth"], summary: "Register new customer", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password", "firstName", "lastName"], properties: { email: { type: "string" }, password: { type: "string" }, firstName: { type: "string" }, lastName: { type: "string" }, phone: { type: "string" } } } } } }, responses: { 201: { description: "User registered" } } },
  },
  "/auth/login": {
    post: { tags: ["Auth"], summary: "Login with email/password", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string" } } } } } }, responses: { 200: { description: "JWT tokens returned" } } },
  },
  "/auth/refresh": {
    post: { tags: ["Auth"], summary: "Refresh access token", responses: { 200: { description: "New tokens" } } },
  },
  "/auth/profile": {
    get: { tags: ["Auth"], summary: "Get current user profile", security: [{ BearerAuth: [] }], responses: { 200: { description: "User profile" } } },
    put: { tags: ["Auth"], summary: "Update profile", security: [{ BearerAuth: [] }], responses: { 200: { description: "Updated profile" } } },
  },

  // Geography
  "/geo/wilayas": {
    get: { tags: ["Geography"], summary: "List all 58 wilayas", responses: { 200: { description: "List of wilayas" } } },
  },
  "/geo/wilayas/{id}/communes": {
    get: { tags: ["Geography"], summary: "List communes for a wilaya", parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }], responses: { 200: { description: "List of communes" } } },
  },

  // Products
  "/products": {
    get: { tags: ["Products"], summary: "List products (paginated, filterable)", parameters: [{ name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }, { name: "category", in: "query", schema: { type: "string" } }, { name: "search", in: "query", schema: { type: "string" } }, { name: "minPrice", in: "query", schema: { type: "number" } }, { name: "maxPrice", in: "query", schema: { type: "number" } }], responses: { 200: { description: "Paginated product list" } } },
    post: { tags: ["Products"], summary: "Create product (Admin)", security: [{ BearerAuth: [] }], responses: { 201: { description: "Product created" } } },
  },
  "/products/{idOrSlug}": {
    get: { tags: ["Products"], summary: "Get product detail", parameters: [{ name: "idOrSlug", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Product detail" } } },
  },

  // Cart
  "/cart": {
    get: { tags: ["Cart"], summary: "Get current cart", security: [{ BearerAuth: [] }], responses: { 200: { description: "Cart with items" } } },
    delete: { tags: ["Cart"], summary: "Clear cart", security: [{ BearerAuth: [] }], responses: { 200: { description: "Cart cleared" } } },
  },
  "/cart/items": {
    post: { tags: ["Cart"], summary: "Add item to cart", security: [{ BearerAuth: [] }], responses: { 200: { description: "Item added" } } },
  },

  // Orders
  "/orders": {
    post: { tags: ["Orders"], summary: "Place order from cart", security: [{ BearerAuth: [] }], responses: { 201: { description: "Order placed" } } },
    get: { tags: ["Orders"], summary: "List my orders", security: [{ BearerAuth: [] }], responses: { 200: { description: "Order list" } } },
  },

  // Wishlist
  "/wishlist": {
    get: { tags: ["Wishlist"], summary: "Get wishlist", security: [{ BearerAuth: [] }], responses: { 200: { description: "Wishlist with items" } } },
    delete: { tags: ["Wishlist"], summary: "Clear wishlist", security: [{ BearerAuth: [] }], responses: { 200: { description: "Wishlist cleared" } } },
  },
  "/wishlist/items": {
    post: { tags: ["Wishlist"], summary: "Add item to wishlist", security: [{ BearerAuth: [] }], responses: { 200: { description: "Item added" } } },
    delete: { tags: ["Wishlist"], summary: "Remove item from wishlist", security: [{ BearerAuth: [] }], responses: { 200: { description: "Item removed" } } },
  },

  // Notifications
  "/notifications": {
    get: { tags: ["Notifications"], summary: "Get user notifications", security: [{ BearerAuth: [] }], parameters: [{ name: "page", in: "query", schema: { type: "integer" } }], responses: { 200: { description: "Notification list" } } },
  },

  // Search
  "/search": {
    get: { tags: ["Search"], summary: "Full-text product search", parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }, { name: "category", in: "query", schema: { type: "string" } }, { name: "minPrice", in: "query", schema: { type: "number" } }, { name: "maxPrice", in: "query", schema: { type: "number" } }], responses: { 200: { description: "Search results" } } },
  },
  "/search/suggest": {
    get: { tags: ["Search"], summary: "Search autocomplete suggestions", parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "Suggestions" } } },
  },

  // Recommendations
  "/recommendations/also-bought/{productId}": {
    get: { tags: ["Recommendations"], summary: "Get also-bought products", parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Recommended products" } } },
  },
  "/recommendations/personalized": {
    get: { tags: ["Recommendations"], summary: "Get personalized recommendations", security: [{ BearerAuth: [] }], responses: { 200: { description: "Personalized products" } } },
  },

  // Gift Cards
  "/gift-cards": {
    post: { tags: ["Gift Cards"], summary: "Purchase a gift card", security: [{ BearerAuth: [] }], responses: { 201: { description: "Gift card created" } } },
  },
  "/gift-cards/redeem": {
    post: { tags: ["Gift Cards"], summary: "Redeem a gift card", security: [{ BearerAuth: [] }], responses: { 200: { description: "Gift card redeemed" } } },
  },

  // Loyalty
  "/loyalty/balance": {
    get: { tags: ["Loyalty"], summary: "Get loyalty points balance & tier", security: [{ BearerAuth: [] }], responses: { 200: { description: "Balance and tier info" } } },
  },
  "/loyalty/redeem": {
    post: { tags: ["Loyalty"], summary: "Redeem loyalty points", security: [{ BearerAuth: [] }], responses: { 200: { description: "Points redeemed" } } },
  },

  // Subscriptions
  "/subscriptions": {
    post: { tags: ["Subscriptions"], summary: "Create recurring subscription", security: [{ BearerAuth: [] }], responses: { 201: { description: "Subscription created" } } },
    get: { tags: ["Subscriptions"], summary: "Get my subscriptions", security: [{ BearerAuth: [] }], responses: { 200: { description: "Subscription list" } } },
  },

  // Vendors
  "/vendors/stores": {
    get: { tags: ["Vendors"], summary: "List public vendor stores", responses: { 200: { description: "Store list" } } },
  },
  "/vendors/apply": {
    post: { tags: ["Vendors"], summary: "Apply as a vendor", security: [{ BearerAuth: [] }], responses: { 201: { description: "Application submitted" } } },
  },

  // Bundles
  "/bundles": {
    get: { tags: ["Bundles"], summary: "List product bundles", responses: { 200: { description: "Bundle list" } } },
  },

  // Returns
  "/returns": {
    post: { tags: ["Returns"], summary: "Create return request", security: [{ BearerAuth: [] }], responses: { 201: { description: "Return created" } } },
    get: { tags: ["Returns"], summary: "Get my returns", security: [{ BearerAuth: [] }], responses: { 200: { description: "Return list" } } },
  },

  // Newsletter
  "/newsletter/subscribe": {
    post: { tags: ["Newsletter"], summary: "Subscribe to newsletter", responses: { 200: { description: "Subscribed" } } },
  },

  // Webhooks
  "/webhooks": {
    post: { tags: ["Webhooks"], summary: "Create webhook endpoint", security: [{ BearerAuth: [] }], responses: { 201: { description: "Webhook created" } } },
    get: { tags: ["Webhooks"], summary: "List webhook endpoints", security: [{ BearerAuth: [] }], responses: { 200: { description: "Webhook list" } } },
  },

  // Admin
  "/admin/dashboard": {
    get: { tags: ["Admin"], summary: "Dashboard statistics", security: [{ BearerAuth: [] }], responses: { 200: { description: "Dashboard data" } } },
  },
  "/admin/audit-logs": {
    get: { tags: ["Admin"], summary: "View audit logs", security: [{ BearerAuth: [] }], parameters: [{ name: "entity", in: "query", schema: { type: "string" } }, { name: "action", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Audit log list" } } },
  },
  "/admin/bulk/products/prices": {
    post: { tags: ["Bulk Operations"], summary: "Bulk update product prices", security: [{ BearerAuth: [] }], responses: { 200: { description: "Prices updated" } } },
  },
  "/admin/bulk/products/import": {
    post: { tags: ["Bulk Operations"], summary: "Bulk import products", security: [{ BearerAuth: [] }], responses: { 200: { description: "Products imported" } } },
  },
};
