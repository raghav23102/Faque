import type { Config } from "@react-router/dev/config";

export default {
  // Allow Shopify admin origins to POST to our action routes
  // This fixes the CSRF check that blocks form submissions from the Shopify iframe
  allowedActionOrigins: [
    "*.myshopify.com",
    "*.shopify.com",
    "admin.shopify.com",
    "localhost",
    "127.0.0.1",
  ],
} satisfies Config;
