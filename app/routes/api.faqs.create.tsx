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
    let newId = "";
    let faq = null;
    
    // Try to generate a unique 4-digit ID
    for (let attempts = 0; attempts < 5; attempts++) {
      newId = `faque-${Math.floor(1000 + Math.random() * 9000)}`;
      try {
        faq = await prisma.fAQ.create({
          data: {
            id: newId,
            shop: session.shop,
            name,
            heading,
            description,
            designId: "01",
            settings: JSON.stringify({}),
          },
        });
        break; // Success
      } catch (e: any) {
        if (e.code === 'P2002') continue; // Unique constraint failed, retry
        throw e;
      }
    }

    if (!faq) {
      throw new Error("Failed to generate a unique FAQ ID. Please try again.");
    }

    return Response.json({ faqId: faq.id });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
