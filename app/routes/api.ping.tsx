import { json } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // This endpoint solely exists so the Shopify verification bot
  // can see a session token being sent via the Authorization header.
  try {
    await authenticate.admin(request);
    return json({ success: true, message: "pong" });
  } catch (error) {
    return json({ success: false }, { status: 401 });
  }
};
