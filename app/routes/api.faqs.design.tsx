import { authenticate } from "../shopify.server";
import { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";
import { canAccessDesign } from "../designs/registry";
import { getSubscription } from "../models/Subscription.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { faqId, designId } = body;

  if (!faqId || !designId) {
    return Response.json({ error: "faqId and designId required" }, { status: 422 });
  }

  // Verify plan access
  const subscription = await getSubscription(session.shop);
  if (!canAccessDesign(subscription.plan, designId)) {
    return Response.json(
      { error: "Your current plan does not include this design. Please upgrade." },
      { status: 403 }
    );
  }

  // Verify FAQ ownership
  const faq = await prisma.fAQ.findUnique({
    where: { id: faqId, shop: session.shop },
  });

  if (!faq) {
    return Response.json({ error: "FAQ not found" }, { status: 404 });
  }

  const updated = await prisma.fAQ.update({
    where: { id: faqId },
    data: { designId },
  });

  return Response.json({ faq: updated });
};
