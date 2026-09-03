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
  const validPlans = ["Simple", "Pro", "Ultimate", "Free"];

  if (!plan || !validPlans.includes(plan)) {
    return Response.json({ error: "Invalid plan selected." }, { status: 422 });
  }

  try {
    const shopName = session.shop.split(".")[0];
    const returnUrl = `https://admin.shopify.com/store/${shopName}/apps/${process.env.SHOPIFY_API_KEY}/app/billing`;
    
    // If downgrading to Free, cancel active subscription
    if (plan === "Free") {
      const { hasActivePayment, appSubscriptions } = await (billing as any).check({
        plans: ["Simple", "Pro", "Ultimate"],
        isTest: false,
      });

      if (hasActivePayment && appSubscriptions.length > 0) {
        await (billing as any).cancel({
          subscriptionId: appSubscriptions[0].id,
          isTest: false,
        });
      }
      
      // Update local db
      const { updateSubscription } = await import("../models/Subscription.server");
      await updateSubscription(session.shop, "Free");
      
      return Response.json({ confirmationUrl: returnUrl }); // Redirect back to billing page
    }

    // Otherwise, request a new subscription
    const result = await (billing as any).request({
      plan,
      isTest: false,
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
