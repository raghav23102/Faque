import { authenticate } from "../shopify.server";
import { ActionFunctionArgs } from "react-router";

/**
 * Resource route — triggers Shopify billing subscription.
 * Returns confirmationUrl to redirect user to Shopify payment page.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { plan } = body;
  const validPlans = ["Simple", "Pro", "Ultimate"];

  if (!plan || !validPlans.includes(plan)) {
    return Response.json({ error: "Invalid plan selected." }, { status: 422 });
  }

  try {
    const result = await billing.request({
      plan,
      isTest: true, // Remove this in production
      returnUrl: `${process.env.SHOPIFY_APP_URL}/app/billing`,
    });

    return Response.json({ confirmationUrl: result.confirmationUrl });
  } catch (err: any) {
    console.error("Billing error:", err);
    return Response.json(
      { error: err.message || "Failed to create subscription." },
      { status: 500 }
    );
  }
};
