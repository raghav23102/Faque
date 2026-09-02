import { authenticate } from "../shopify.server";
import { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";

/**
 * Resource route — bypasses React Router CSRF check.
 * Accepts Bearer token from shopify.idToken().
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const faqId = (formData.get("faqId") as string)?.trim();
  const question = (formData.get("question") as string)?.trim();
  const answer = (formData.get("answer") as string)?.trim();

  if (!faqId || !question || !answer) {
    return Response.json({ error: "faqId, question and answer are required." }, { status: 422 });
  }

  // Verify the FAQ belongs to this shop
  const faq = await prisma.fAQ.findUnique({
    where: { id: faqId, shop: session.shop },
    include: { questions: { orderBy: { position: 'desc' }, take: 1 } }
  });

  if (!faq) {
    return Response.json({ error: "FAQ not found." }, { status: 404 });
  }

  const nextPos = (faq.questions[0]?.position || 0) + 1;

  const newQuestion = await prisma.question.create({
    data: { faqId, question, answer, position: nextPos }
  });

  return Response.json({ question: newQuestion });
};
