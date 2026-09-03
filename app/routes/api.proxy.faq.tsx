import { LoaderFunctionArgs } from "react-router";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.public.appProxy(request);

    if (!session) {
      return new Response("Unauthorized App Proxy Request", { status: 401 });
    }

    const url = new URL(request.url);
    const faqId = url.searchParams.get("faqId");

    if (!faqId) {
      return new Response("Missing faqId", { status: 400 });
    }

    const faq = await prisma.fAQ.findUnique({
      where: { id: faqId, shop: session.shop },
      include: { questions: { orderBy: { position: "asc" } } },
    });

    if (!faq) {
      return new Response("FAQ not found", { status: 404 });
    }

    let settings = {};
    try {
      settings = JSON.parse(faq.settings || "{}");
    } catch(e) {}

    // Return the JSON data directly so Liquid block can render it using Javascript or we can generate the HTML in JS
    // For 15 dynamic layouts, HTML returned from server is best for SEO and simplicity.
    const html = renderFaqHTML(faq, settings);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("App Proxy Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
};

function renderFaqHTML(faq: any, settings: any) {
  const designId = faq.designId;
  const questions = faq.questions || [];
  const imageUrl = settings.imageUrl || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png";
  
  let html = `<div class="faque-container design-${designId}" style="width: 100%; box-sizing: border-box; font-family: sans-serif;">`;
  html += `<h2 style="margin-bottom: 24px; font-size: 24px;">${faq.heading}</h2>`;
  
  // 08: Image FAQ
  if (designId === "08") {
    html += `<div style="display: flex; gap: 32px; flex-wrap: wrap;">`;
    html += `<div style="flex: 1; min-width: 300px;"><img src="${imageUrl}" style="width: 100%; border-radius: 8px; object-fit: cover;" /></div>`;
    html += `<div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 16px;">`;
    
    for (let i = 0; i < questions.length; i++) {
      html += `
        <div class="faque-item" style="padding: 16px 0; border-bottom: 1px solid #e1e3e5; cursor: pointer;">
          <div class="faque-q" style="font-weight: bold; font-size: 16px; margin-bottom: 10px; display: flex; justify-content: space-between;">
            ${questions[i].question} <span>+</span>
          </div>
          <div class="faque-a" style="display: none; color: #4a4a4a; font-size: 15px; line-height: 1.6;">
            ${questions[i].answer}
          </div>
        </div>
      `;
    }
    html += `</div></div>`;
  } else {
    // Basic fallback for other designs (you can expand this to all 15 just like React later)
    html += `<div class="faque-list" style="display: flex; flex-direction: column; gap: 16px;">`;
    for (let i = 0; i < questions.length; i++) {
      html += `
        <div class="faque-item" style="padding: 16px 0; border-bottom: 1px solid #e1e3e5; cursor: pointer;">
          <div class="faque-q" style="font-weight: bold; font-size: 16px; margin-bottom: 10px; display: flex; justify-content: space-between;">
            ${questions[i].question} <span class="faque-icon">+</span>
          </div>
          <div class="faque-a" style="display: none; color: #4a4a4a; font-size: 15px; line-height: 1.6;">
            ${questions[i].answer}
          </div>
        </div>
      `;
    }
    html += `</div>`;
  }
  
  html += `</div>`;
  
  // Accordion script
  html += `
    <script>
      (function() {
        const container = document.currentScript.parentElement;
        const items = container.querySelectorAll('.faque-item');
        items.forEach(item => {
          item.addEventListener('click', () => {
            const answer = item.querySelector('.faque-a');
            const icon = item.querySelector('.faque-icon');
            if (answer.style.display === 'none' || answer.style.display === '') {
              answer.style.display = 'block';
              if(icon) icon.innerText = '-';
            } else {
              answer.style.display = 'none';
              if(icon) icon.innerText = '+';
            }
          });
        });
      })();
    </script>
  `;
  
  return html;
}
