import { authenticate } from "../shopify.server";
import { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { faqId } = body;
  if (!faqId) return Response.json({ error: "faqId required" }, { status: 422 });

  // Verify ownership
  const faq = await prisma.fAQ.findUnique({ where: { id: faqId, shop: session.shop } });
  if (!faq) return Response.json({ error: "FAQ not found" }, { status: 404 });

  // Delete questions first (cascade), then FAQ
  await prisma.question.deleteMany({ where: { faqId } });
  await prisma.fAQ.delete({ where: { id: faqId } });

  return Response.json({ success: true });
};
