import { authenticate } from "../shopify.server";
import { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const questionId = formData.get("questionId") as string;

  if (!questionId) {
    return Response.json({ error: "questionId is required" }, { status: 422 });
  }

  // Verify the question belongs to an FAQ owned by this shop
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { faq: true }
  });

  if (!question || question.faq.shop !== session.shop) {
    return Response.json({ error: "Question not found or unauthorized" }, { status: 404 });
  }

  await prisma.question.delete({
    where: { id: questionId }
  });

  return Response.json({ success: true });
};
