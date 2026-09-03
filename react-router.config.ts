import type { Config } from "@react-router/dev/config";

export default {
  // Webhook security is handled by Shopify's authenticate.webhook() HMAC verification.
  // Removing allowedActionOrigins so Shopify's server-to-server webhook delivery
  // is not blocked by React Router's CSRF protection.
} satisfies Config;
