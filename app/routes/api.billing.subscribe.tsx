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
    const shopName = session.shop.split(".")[0];
    const returnUrl = `https://admin.shopify.com/store/${shopName}/apps/${process.env.SHOPIFY_API_KEY}/app/billing`;
    
    const result = await (billing as any).request({
      plan,
      isTest: true, // Remove this in production
      returnUrl: returnUrl,
    });

    return Response.json({ confirmationUrl: result.confirmationUrl || result.appSubscriptionCreate?.confirmationUrl });
  } catch (err: any) {
    // Shopify App Remix often throws a Response object to trigger a redirect
    if (err instanceof Response || (err && typeof err.status === 'number' && err.headers)) {
      const reauthUrl = err.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url");
      if (reauthUrl) {
        return Response.json({ confirmationUrl: reauthUrl });
      }
      
      const location = err.headers.get("location") || err.headers.get("Location");
      if (location) {
        return Response.json({ confirmationUrl: location });
      }
    }
    
    console.error("Billing error:", err);
    return Response.json(
      { error: err.message || "Failed to create subscription." },
      { status: 500 }
    );
  }
};
