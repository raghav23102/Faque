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

  const { faqId, designId, settings } = body;

  if (!faqId) {
    return Response.json({ error: "faqId is required" }, { status: 422 });
  }

  if (designId) {
    // Verify plan access
    const subscription = await getSubscription(session.shop);
    if (!canAccessDesign(subscription.plan, designId)) {
      return Response.json(
        { error: "Your current plan does not include this design. Please upgrade." },
        { status: 403 }
      );
    }
  }

  // Verify FAQ ownership
  const faq = await prisma.fAQ.findUnique({
    where: { id: faqId, shop: session.shop },
  });

  if (!faq) {
    return Response.json({ error: "FAQ not found" }, { status: 404 });
  }

  let dataToUpdate: any = {};
  if (designId) dataToUpdate.designId = designId;
  if (settings) {
    try {
      // Merge new settings with old settings
      const oldSettings = JSON.parse(faq.settings || "{}");
      dataToUpdate.settings = JSON.stringify({ ...oldSettings, ...settings });
    } catch {
      dataToUpdate.settings = JSON.stringify(settings);
    }
  }

  const updated = await prisma.fAQ.update({
    where: { id: faqId },
    data: dataToUpdate,
  });

  return Response.json({ faq: updated });
};
