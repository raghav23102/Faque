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
        "Cache-Control": "no-cache, no-store, must-revalidate",
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

  const categories: string[] = Array.from(new Set(questions.map((q: any) => q.category).filter(Boolean)));
  const hasCategories = categories.length > 0;

  // Helper: render a standard <details>/<summary> accordion item
  const accordionItem = (q: any, extraClasses = "", extraAttrs = "") =>
    `<details class="faque-item ${extraClasses}" ${extraAttrs}>
      <summary>${escapeHtml(q.question)}</summary>
      <div class="faque-answer">${escapeHtml(q.answer)}</div>
    </details>`;

  let inner = "";

  if (designId === "01") {
    // Minimal Accordion — uses <details>/<summary>, CSS handles +/−
    inner = questions.map((q: any) => accordionItem(q)).join("\n");

  } else if (designId === "02") {
    // Modern Cards — card wrapper around each <details>
    inner = questions.map((q: any) => accordionItem(q)).join("\n");

  } else if (designId === "03") {
    // Two Column — items inside a grid wrapper
    const items = questions.map((q: any) => accordionItem(q)).join("\n");
    inner = `<div class="faque-grid">${items}</div>`;

  } else if (designId === "04") {
    // Editorial — numbered layout
    inner = questions.map((q: any, idx: number) =>
      `<div class="faque-item">
        <div class="faque-item-num">${String(idx + 1).padStart(2, "0")}</div>
        <div class="faque-item-body">
          <details>
            <summary>${escapeHtml(q.question)}</summary>
            <div class="faque-answer">${escapeHtml(q.answer)}</div>
          </details>
        </div>
      </div>`
    ).join("\n");

  } else if (designId === "05") {
    // Category Tabs — tab bar + filterable accordion items
    let tabs = "";
    if (hasCategories) {
      tabs = `<div class="faque-tabs">
        <button class="faque-tab-btn active" data-category="All">All</button>
        ${categories.map(c => `<button class="faque-tab-btn" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
      </div>`;
    }
    const items = questions.map((q: any) =>
      `<details class="faque-item visible" data-category="${escapeHtml(q.category || "")}">
        <summary>${escapeHtml(q.question)}</summary>
        <div class="faque-answer">${escapeHtml(q.answer)}</div>
      </details>`
    ).join("\n");
    inner = tabs + items;

  } else if (designId === "06") {
    // Sidebar FAQ — sidebar categories + main content
    let sidebar = "";
    if (hasCategories) {
      sidebar = `<div class="faque-sidebar">
        <button class="faque-cat-btn active" data-category="All">All</button>
        ${categories.map(c => `<button class="faque-cat-btn" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
      </div>`;
    }
    const items = questions.map((q: any) =>
      `<details class="faque-item" data-category="${escapeHtml(q.category || "")}">
        <summary>${escapeHtml(q.question)}</summary>
        <div class="faque-answer">${escapeHtml(q.answer)}</div>
      </details>`
    ).join("\n");
    inner = `<div class="faque-layout">${sidebar}<div class="faque-content">${items}</div></div>`;

  } else if (designId === "07") {
    // Search FAQ — search input + hidden-by-filter items
    const searchBox = `<div class="faque-search-wrap">
      <span class="faque-search-icon">🔍</span>
      <input class="faque-search" type="search" placeholder="Search for answers..." />
    </div>`;
    const items = questions.map((q: any) =>
      `<details class="faque-item">
        <summary>${escapeHtml(q.question)}</summary>
        <div class="faque-answer">${escapeHtml(q.answer)}</div>
      </details>`
    ).join("\n");
    inner = searchBox + items;

  } else if (designId === "08") {
    // Image + FAQ — image panel beside accordion
    const items = questions.map((q: any) => accordionItem(q)).join("\n");
    inner = `<div class="faque-layout">
      <div class="faque-img-wrap"><img src="${escapeHtml(imageUrl)}" alt="FAQ image" /></div>
      <div class="faque-content">${items}</div>
    </div>`;

  } else if (designId === "09") {
    // Centered Premium — bordered accordion, centered heading handled by CSS
    inner = questions.map((q: any) => accordionItem(q)).join("\n");

  } else if (designId === "10") {
    // Dark FAQ — uses same accordion structure, CSS applies dark theme
    inner = questions.map((q: any) => accordionItem(q)).join("\n");

  } else if (designId === "11") {
    // Highlighted Question — icon + question
    inner = questions.map((q: any, idx: number) =>
      `<div class="faque-item">
        <div class="faque-item-icon">Q</div>
        <div class="faque-item details">
          <details>
            <summary>${escapeHtml(q.question)}</summary>
            <div class="faque-answer">${escapeHtml(q.answer)}</div>
          </details>
        </div>
      </div>`
    ).join("\n");

  } else if (designId === "12") {
    // Borderless FAQ
    inner = questions.map((q: any) => accordionItem(q)).join("\n");

  } else if (designId === "13") {
    // Split FAQ — question list on left, answer panel on right
    const qBtns = questions.map((q: any, idx: number) =>
      `<button class="faque-q-btn${idx === 0 ? " active" : ""}" data-question="${escapeHtml(q.question)}" data-answer="${escapeHtml(q.answer)}">${escapeHtml(q.question)}</button>`
    ).join("\n");
    const firstQ = questions[0] || { question: "", answer: "" };
    inner = `<div class="faque-layout">
      <div class="faque-questions-list">${qBtns}</div>
      <div class="faque-answer-panel">
        <h3>${escapeHtml(firstQ.question)}</h3>
        <p>${escapeHtml(firstQ.answer)}</p>
      </div>
    </div>`;

  } else if (designId === "14") {
    // Timeline FAQ
    const items = questions.map((q: any) =>
      `<div class="faque-item">
        <details>
          <summary>${escapeHtml(q.question)}</summary>
          <div class="faque-answer">${escapeHtml(q.answer)}</div>
        </details>
      </div>`
    ).join("\n");
    inner = `<div class="faque-timeline">${items}</div>`;

  } else if (designId === "15") {
    // Compact FAQ
    inner = questions.map((q: any) => accordionItem(q)).join("\n");

  } else {
    // Generic fallback
    inner = questions.map((q: any) => accordionItem(q)).join("\n");
  }

  // Wrap with the correct .faque-dXX class that faque.css targets
  return `<div class="faque-d${designId}">${
    `<h2 class="faque-heading">${escapeHtml(faq.heading)}</h2>` + inner
  }</div>`;
}

/** Escape HTML special chars to prevent XSS in rendered storefront HTML */
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
