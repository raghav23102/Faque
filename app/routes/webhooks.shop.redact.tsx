import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`, payload);

  try {
    // Delete all shop data when shop/redact is triggered (GDPR compliance)
    await db.session.deleteMany({ where: { shop } });
    await db.fAQ.deleteMany({ where: { shop } });
    await db.subscription.deleteMany({ where: { shop } });
  } catch (err) {
    console.error(`Error redacting shop data for ${shop}:`, err);
  }

  return new Response(null, { status: 200 });
};
