import { authenticate } from "../shopify.server";
import { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";

/**
 * Resource route — bypasses React Router's CSRF check entirely.
 * Uses Shopify's token-based auth via the Authorization: Bearer header
 * injected by App Bridge's idToken().
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  // authenticate.admin works for both session-cookie and Bearer token auth
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const name = (formData.get("name") as string)?.trim();
  const heading = (formData.get("heading") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";

  if (!name || !heading) {
    return Response.json({ error: "Name and Heading are required." }, { status: 422 });
  }

  try {
    const faq = await prisma.fAQ.create({
      data: {
        shop: session.shop,
        name,
        heading,
        description,
        designId: "01",
        settings: JSON.stringify({}),
      },
    });
    return Response.json({ faqId: faq.id });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
