import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * Unified compliance webhook handler for:
 * - customers/data_request
 * - customers/redact
 * - shop/redact
 *
 * Shopify sends all 3 topics to this single endpoint.
 * The X-Shopify-Topic header identifies which event was fired.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);

  console.log(`[Compliance Webhook] Received: ${topic} for shop: ${shop}`);

  try {
    switch (topic) {
      case "CUSTOMERS_DATA_REQUEST":
        // The app does not store personal customer data.
        // Log the request for compliance records only.
        console.log(`[GDPR] Customer data request for shop: ${shop}`, payload);
        break;

      case "CUSTOMERS_REDACT":
        // The app does not store personal customer data.
        // No action needed.
        console.log(`[GDPR] Customer redact request for shop: ${shop}`, payload);
        break;

      case "SHOP_REDACT":
        // App was uninstalled >48 hours ago. Delete all shop data.
        console.log(`[GDPR] Shop redact request for shop: ${shop}`, payload);
        await db.session.deleteMany({ where: { shop } });
        await db.fAQ.deleteMany({ where: { shop } });
        await db.subscription.deleteMany({ where: { shop } });
        console.log(`[GDPR] Successfully deleted all data for shop: ${shop}`);
        break;

      default:
        console.warn(`[Compliance Webhook] Unknown topic: ${topic}`);
    }
  } catch (err) {
    console.error(`[Compliance Webhook] Error processing ${topic} for ${shop}:`, err);
    // Still return 200 to acknowledge receipt — Shopify requires this
  }

  return new Response(null, { status: 200 });
};
