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

// ─── Inline CSS — embedded in every response so Shopify themes cannot override ───
const FAQUE_CSS = `
<style>
/* ===== FAQUE — Scoped reset ===== */
.faque-root, .faque-root *, .faque-root *::before, .faque-root *::after {
  box-sizing: border-box !important;
}
.faque-root { font-family: inherit; width: 100%; }
.faque-root details summary { list-style: none; }
.faque-root details summary::-webkit-details-marker { display: none !important; }

/* ── D01 Minimal Accordion ── */
.faque-d01 {}
.faque-d01 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d01 details.faque-item { border-bottom: 1px solid #e5e7eb !important; }
.faque-d01 details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 16px 0 !important; cursor: pointer !important; font-weight: 600 !important; font-size: 1rem !important; color: inherit !important; }
.faque-d01 details.faque-item summary::after { content: '+' !important; font-size: 1.25rem !important; color: #9ca3af !important; }
.faque-d01 details.faque-item[open] summary::after { content: '−' !important; }
.faque-d01 .faque-answer { padding: 0 0 16px !important; color: #6b7280 !important; line-height: 1.6 !important; }

/* ── D02 Modern Cards ── */
.faque-d02 { }
.faque-d02 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d02 details.faque-item { border: 1px solid #e5e7eb !important; border-radius: 12px !important; margin-bottom: 12px !important; overflow: hidden !important; background: #fff !important; transition: box-shadow 0.2s !important; }
.faque-d02 details.faque-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; }
.faque-d02 details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 18px 20px !important; cursor: pointer !important; font-weight: 600 !important; color: #005bd3 !important; background: #fff !important; }
.faque-d02 details.faque-item summary::after { content: '▾' !important; font-size: 0.9rem !important; color: #6b7280 !important; transition: transform 0.25s !important; }
.faque-d02 details.faque-item[open] summary::after { transform: rotate(-180deg) !important; }
.faque-d02 .faque-answer { padding: 14px 20px 18px !important; border-top: 1px solid #f3f4f6 !important; color: #6b7280 !important; line-height: 1.6 !important; background: #fff !important; }

/* ── D03 Two Column ── */
.faque-d03 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d03 .faque-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
@media(max-width:640px){ .faque-d03 .faque-grid { grid-template-columns: 1fr !important; } }
.faque-d03 details.faque-item { border-left: 3px solid #5c6ac4 !important; padding-left: 16px !important; margin-bottom: 8px !important; }
.faque-d03 details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 10px 0 !important; cursor: pointer !important; font-weight: 600 !important; color: inherit !important; border-bottom: 2px solid #000 !important; }
.faque-d03 .faque-answer { padding: 8px 0 0 !important; color: #6b7280 !important; line-height: 1.6 !important; }

/* ── D04 Editorial ── */
.faque-d04 { font-family: Georgia, serif !important; }
.faque-d04 .faque-heading { font-size: 2rem !important; font-weight: 700 !important; margin: 0 0 8px !important; border-bottom: 2px solid #000 !important; padding-bottom: 16px !important; margin-bottom: 24px !important; color: inherit !important; }
.faque-d04 .faque-item { display: flex !important; gap: 24px !important; border-bottom: 1px solid #000 !important; padding: 24px 0 !important; }
.faque-d04 .faque-item-num { font-size: 2rem !important; color: #ccc !important; font-weight: bold !important; line-height: 1 !important; min-width: 40px !important; }
.faque-d04 .faque-item-body { flex: 1 !important; }
.faque-d04 .faque-item-body details summary { cursor: pointer !important; font-weight: 400 !important; font-size: 1.15rem !important; list-style: none !important; color: inherit !important; padding: 4px 0 !important; }
.faque-d04 .faque-answer { margin-top: 12px !important; color: #6b7280 !important; line-height: 1.7 !important; }

/* ── D05 Category Tabs ── */
.faque-d05 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d05 .faque-tabs { display: flex !important; gap: 8px !important; flex-wrap: wrap !important; margin-bottom: 20px !important; }
.faque-d05 .faque-tab-btn { padding: 6px 18px !important; border-radius: 20px !important; border: 1px solid #e5e7eb !important; background: #f4f6f8 !important; color: #333 !important; cursor: pointer !important; font-size: 0.9rem !important; transition: all 0.2s !important; }
.faque-d05 .faque-tab-btn.active { background: #5c6ac4 !important; color: #fff !important; border-color: #5c6ac4 !important; }
.faque-d05 details.faque-item { border-bottom: 1px solid #e5e7eb !important; display: none !important; }
.faque-d05 details.faque-item.visible { display: block !important; }
.faque-d05 details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 14px 0 !important; cursor: pointer !important; font-weight: 600 !important; color: inherit !important; }
.faque-d05 details.faque-item summary::after { content: '+' !important; font-size: 1.1rem !important; color: #9ca3af !important; }
.faque-d05 details.faque-item[open] summary::after { content: '−' !important; }
.faque-d05 .faque-answer { padding: 0 0 14px !important; color: #6b7280 !important; line-height: 1.6 !important; }

/* ── D06 Sidebar FAQ ── */
.faque-d06 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d06 .faque-layout { display: grid !important; grid-template-columns: 200px 1fr !important; gap: 24px !important; }
@media(max-width:640px){ .faque-d06 .faque-layout { grid-template-columns: 1fr !important; } .faque-d06 .faque-sidebar { display: none !important; } }
.faque-d06 .faque-sidebar { background: #f9fafb !important; border-radius: 10px !important; padding: 16px !important; }
.faque-d06 .faque-cat-btn { display: block !important; width: 100% !important; text-align: left !important; padding: 10px 14px !important; border-radius: 8px !important; border: none !important; background: transparent !important; cursor: pointer !important; font-size: 0.9rem !important; margin-bottom: 4px !important; color: #555 !important; transition: background 0.2s !important; }
.faque-d06 .faque-cat-btn.active { background: #5c6ac4 !important; color: #fff !important; font-weight: 600 !important; }
.faque-d06 .faque-content details.faque-item { border-bottom: 1px solid #e5e7eb !important; }
.faque-d06 .faque-content details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 14px 0 !important; cursor: pointer !important; font-weight: 600 !important; color: inherit !important; }
.faque-d06 .faque-content details.faque-item summary::after { content: '+' !important; font-size: 1.1rem !important; color: #9ca3af !important; }
.faque-d06 .faque-content details.faque-item[open] summary::after { content: '−' !important; }
.faque-d06 .faque-answer { padding: 0 0 14px !important; color: #6b7280 !important; line-height: 1.6 !important; }

/* ── D07 Search FAQ ── */
.faque-d07 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d07 .faque-search-wrap { position: relative !important; margin-bottom: 24px !important; }
.faque-d07 .faque-search-icon { position: absolute !important; left: 14px !important; top: 50% !important; transform: translateY(-50%) !important; font-size: 1rem !important; }
.faque-d07 .faque-search { width: 100% !important; padding: 12px 16px 12px 42px !important; border: 2px solid #5c6ac4 !important; border-radius: 10px !important; font-size: 1rem !important; outline: none !important; background: #fff !important; color: #333 !important; }
.faque-d07 details.faque-item { border-bottom: 1px solid #e5e7eb !important; }
.faque-d07 details.faque-item.hidden { display: none !important; }
.faque-d07 details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 14px 0 !important; cursor: pointer !important; font-weight: 600 !important; color: inherit !important; }
.faque-d07 details.faque-item summary::after { content: '+' !important; font-size: 1.1rem !important; color: #9ca3af !important; }
.faque-d07 details.faque-item[open] summary::after { content: '−' !important; }
.faque-d07 .faque-answer { padding: 0 0 14px !important; color: #6b7280 !important; line-height: 1.6 !important; }

/* ── D08 Image + FAQ ── */
.faque-d08 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d08 .faque-layout { display: grid !important; grid-template-columns: 1fr 1.5fr !important; gap: 32px !important; align-items: start !important; }
@media(max-width:640px){ .faque-d08 .faque-layout { grid-template-columns: 1fr !important; } .faque-d08 .faque-img-wrap { display: none !important; } }
.faque-d08 .faque-img-wrap { border-radius: 14px !important; overflow: hidden !important; background: linear-gradient(135deg,#667eea,#764ba2) !important; min-height: 300px !important; }
.faque-d08 .faque-img-wrap img { width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important; }
.faque-d08 .faque-content details.faque-item { border-bottom: 1px solid #e5e7eb !important; }
.faque-d08 .faque-content details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 14px 0 !important; cursor: pointer !important; font-weight: 600 !important; color: inherit !important; }
.faque-d08 .faque-content details.faque-item summary::after { content: '+' !important; font-size: 1.1rem !important; color: #9ca3af !important; }
.faque-d08 .faque-content details.faque-item[open] summary::after { content: '−' !important; }
.faque-d08 .faque-answer { padding: 0 0 14px !important; color: #6b7280 !important; line-height: 1.6 !important; }

/* ── D09 Centered Premium ── */
.faque-d09 { text-align: center !important; font-family: Georgia, serif !important; }
.faque-d09 .faque-heading { text-align: center !important; font-size: 2rem !important; font-weight: 700 !important; margin: 0 0 8px !important; color: inherit !important; }
.faque-d09 .faque-subtitle { text-align: center !important; color: #6b7280 !important; margin-bottom: 32px !important; }
.faque-d09 .faque-items { max-width: 800px !important; margin: 0 auto !important; }
.faque-d09 details.faque-item { border: 1px solid #e5e7eb !important; border-radius: 12px !important; margin-bottom: 12px !important; overflow: hidden !important; text-align: left !important; }
.faque-d09 details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 18px 22px !important; cursor: pointer !important; font-weight: 600 !important; color: inherit !important; }
.faque-d09 details.faque-item summary::after { content: '+' !important; font-size: 1.2rem !important; color: #5c6ac4 !important; }
.faque-d09 details.faque-item[open] summary::after { content: '−' !important; }
.faque-d09 .faque-answer { padding: 0 22px 18px !important; color: #6b7280 !important; line-height: 1.6 !important; }

/* ── D10 Dark FAQ ── */
.faque-d10 { background: #1a1a2e !important; padding: 40px !important; border-radius: 16px !important; color: #e0e0e0 !important; }
.faque-d10 .faque-heading { color: #ffffff !important; font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; }
.faque-d10 details.faque-item { background: #222244 !important; border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 8px !important; margin-bottom: 12px !important; }
.faque-d10 details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 16px 20px !important; cursor: pointer !important; font-weight: 600 !important; color: #e0e0e0 !important; }
.faque-d10 details.faque-item summary::after { content: '+' !important; font-size: 1.2rem !important; color: #00d4ff !important; }
.faque-d10 details.faque-item[open] summary::after { content: '−' !important; }
.faque-d10 .faque-answer { padding: 0 20px 16px !important; color: #9ca3af !important; line-height: 1.6 !important; }

/* ── D11 Highlighted Question ── */
.faque-d11 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d11 .faque-item { display: flex !important; gap: 16px !important; align-items: flex-start !important; padding: 16px !important; border-radius: 10px !important; margin-bottom: 8px !important; transition: background 0.2s !important; border-bottom: 1px solid #eee !important; }
.faque-d11 .faque-item:hover { background: linear-gradient(to right,#e8f0ff,transparent) !important; }
.faque-d11 .faque-item-icon { width: 32px !important; height: 32px !important; border-radius: 50% !important; background: #5c6ac4 !important; color: #fff !important; display: flex !important; align-items: center !important; justify-content: center !important; font-weight: 700 !important; font-size: 0.85rem !important; flex-shrink: 0 !important; }
.faque-d11 .faque-item-body { flex: 1 !important; }
.faque-d11 .faque-item-body details summary { cursor: pointer !important; font-weight: 700 !important; list-style: none !important; padding: 4px 0 !important; color: inherit !important; font-size: 1rem !important; }
.faque-d11 .faque-answer { margin-top: 8px !important; color: #6b7280 !important; line-height: 1.6 !important; }

/* ── D12 Borderless FAQ ── */
.faque-d12 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d12 details.faque-item { padding: 16px 0 !important; border: none !important; margin-bottom: 8px !important; }
.faque-d12 details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; cursor: pointer !important; font-weight: 700 !important; font-size: 1.1rem !important; color: inherit !important; }
.faque-d12 details.faque-item summary::after { content: '↓' !important; font-size: 1rem !important; color: #9ca3af !important; transition: transform 0.2s !important; }
.faque-d12 details.faque-item[open] summary::after { transform: rotate(180deg) !important; }
.faque-d12 .faque-answer { padding-top: 10px !important; color: #6b7280 !important; line-height: 1.6 !important; }

/* ── D13 Split FAQ ── */
.faque-d13 { font-family: Georgia, serif !important; }
.faque-d13 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d13 .faque-layout { display: grid !important; grid-template-columns: 260px 1fr !important; gap: 0 !important; border: 1px solid #e5e7eb !important; border-radius: 14px !important; overflow: hidden !important; }
@media(max-width:640px){ .faque-d13 .faque-layout { grid-template-columns: 1fr !important; } }
.faque-d13 .faque-questions-list { border-right: 1px solid #e5e7eb !important; }
.faque-d13 .faque-q-btn { display: block !important; width: 100% !important; text-align: left !important; padding: 16px 20px !important; border: none !important; border-bottom: 1px solid #f3f4f6 !important; background: #fff !important; cursor: pointer !important; font-weight: 500 !important; font-size: 0.95rem !important; color: #333 !important; transition: background 0.2s !important; }
.faque-d13 .faque-q-btn.active { background: #5c6ac4 !important; color: #fff !important; font-weight: 600 !important; }
.faque-d13 .faque-answer-panel { padding: 28px !important; background: #fafafa !important; }
.faque-d13 .faque-answer-panel h3 { font-size: 1.15rem !important; font-weight: 700 !important; margin-bottom: 12px !important; color: #111 !important; }
.faque-d13 .faque-answer-panel p { color: #6b7280 !important; line-height: 1.7 !important; margin: 0 !important; }

/* ── D14 Timeline FAQ ── */
.faque-d14 .faque-heading { font-size: 1.75rem !important; font-weight: 700 !important; margin: 0 0 24px !important; color: inherit !important; }
.faque-d14 .faque-timeline { position: relative !important; padding-left: 36px !important; }
.faque-d14 .faque-timeline::before { content: '' !important; position: absolute !important; left: 9px !important; top: 0 !important; bottom: 0 !important; width: 2px !important; background: #e5e7eb !important; }
.faque-d14 .faque-item { position: relative !important; margin-bottom: 24px !important; }
.faque-d14 .faque-item::before { content: '' !important; position: absolute !important; left: -31px !important; top: 10px !important; width: 12px !important; height: 12px !important; border-radius: 50% !important; background: #005bd3 !important; border: 3px solid #fff !important; box-shadow: 0 0 0 2px #005bd3 !important; }
.faque-d14 .faque-item details summary { cursor: pointer !important; font-weight: 700 !important; list-style: none !important; padding: 6px 0 !important; color: inherit !important; }
.faque-d14 .faque-answer { margin-top: 8px !important; color: #6b7280 !important; line-height: 1.6 !important; }

/* ── D15 Compact FAQ ── */
.faque-d15 .faque-heading { font-size: 1.5rem !important; font-weight: 700 !important; margin: 0 0 16px !important; color: inherit !important; }
.faque-d15 details.faque-item { border-bottom: 1px solid #f0f0f0 !important; }
.faque-d15 details.faque-item summary { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 10px 0 !important; cursor: pointer !important; font-size: 0.9rem !important; font-weight: 600 !important; color: inherit !important; }
.faque-d15 details.faque-item summary::after { content: '+' !important; font-size: 1rem !important; color: #9ca3af !important; }
.faque-d15 details.faque-item[open] summary::after { content: '−' !important; }
.faque-d15 .faque-answer { padding: 0 0 10px !important; color: #666 !important; font-size: 0.9rem !important; line-height: 1.5 !important; }
</style>`;

// ─── HTML renderer ────────────────────────────────────────────────────────────
function renderFaqHTML(faq: any, settings: any) {
  const designId = faq.designId;
  const questions = faq.questions || [];
  const imageUrl = settings.imageUrl || "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png";
  const categories: string[] = Array.from(new Set(questions.map((q: any) => q.category).filter(Boolean)));
  const hasCategories = categories.length > 0;
  const heading = escapeHtml(faq.heading);

  // Standard <details>/<summary> accordion item
  const acc = (q: any, extraClass = "", extraAttrs = "") =>
    `<details class="faque-item ${extraClass}" ${extraAttrs}>
      <summary>${escapeHtml(q.question)}</summary>
      <div class="faque-answer">${escapeHtml(q.answer)}</div>
    </details>`;

  let inner = "";

  // ── 01 Minimal Accordion ──────────────────────────────────────────────────
  if (designId === "01") {
    inner = `<h2 class="faque-heading">${heading}</h2>` +
      questions.map((q: any) => acc(q)).join("\n");

  // ── 02 Modern Cards ───────────────────────────────────────────────────────
  } else if (designId === "02") {
    inner = `<h2 class="faque-heading">${heading}</h2>` +
      questions.map((q: any) => acc(q)).join("\n");

  // ── 03 Two Column ─────────────────────────────────────────────────────────
  } else if (designId === "03") {
    inner = `<h2 class="faque-heading">${heading}</h2>
      <div class="faque-grid">${questions.map((q: any) => acc(q)).join("\n")}</div>`;

  // ── 04 Editorial ─────────────────────────────────────────────────────────
  } else if (designId === "04") {
    const items = questions.map((q: any, idx: number) =>
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
    inner = `<h2 class="faque-heading">${heading}</h2>${items}`;

  // ── 05 Category Tabs ──────────────────────────────────────────────────────
  } else if (designId === "05") {
    const tabBar = hasCategories
      ? `<div class="faque-tabs">
          <button class="faque-tab-btn active" data-category="All">All</button>
          ${categories.map(c => `<button class="faque-tab-btn" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
        </div>`
      : "";
    const items = questions.map((q: any) =>
      `<details class="faque-item visible" data-category="${escapeHtml(q.category || "")}">
        <summary>${escapeHtml(q.question)}</summary>
        <div class="faque-answer">${escapeHtml(q.answer)}</div>
      </details>`
    ).join("\n");
    inner = `<h2 class="faque-heading">${heading}</h2>${tabBar}${items}`;

  // ── 06 Sidebar FAQ ────────────────────────────────────────────────────────
  } else if (designId === "06") {
    const sidebar = hasCategories
      ? `<div class="faque-sidebar">
          <button class="faque-cat-btn active" data-category="All">All</button>
          ${categories.map(c => `<button class="faque-cat-btn" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
        </div>`
      : "";
    const items = questions.map((q: any) =>
      `<details class="faque-item" data-category="${escapeHtml(q.category || "")}">
        <summary>${escapeHtml(q.question)}</summary>
        <div class="faque-answer">${escapeHtml(q.answer)}</div>
      </details>`
    ).join("\n");
    inner = `<h2 class="faque-heading">${heading}</h2>
      <div class="faque-layout">${sidebar}<div class="faque-content">${items}</div></div>`;

  // ── 07 Search FAQ ─────────────────────────────────────────────────────────
  } else if (designId === "07") {
    const items = questions.map((q: any) =>
      `<details class="faque-item">
        <summary>${escapeHtml(q.question)}</summary>
        <div class="faque-answer">${escapeHtml(q.answer)}</div>
      </details>`
    ).join("\n");
    inner = `<h2 class="faque-heading">${heading}</h2>
      <div class="faque-search-wrap">
        <span class="faque-search-icon">🔍</span>
        <input class="faque-search" type="search" placeholder="Search for answers…" />
      </div>${items}`;

  // ── 08 Image + FAQ ────────────────────────────────────────────────────────
  } else if (designId === "08") {
    const items = questions.map((q: any) => acc(q)).join("\n");
    inner = `<h2 class="faque-heading">${heading}</h2>
      <div class="faque-layout">
        <div class="faque-img-wrap"><img src="${escapeHtml(imageUrl)}" alt="FAQ image" /></div>
        <div class="faque-content">${items}</div>
      </div>`;

  // ── 09 Centered Premium ───────────────────────────────────────────────────
  } else if (designId === "09") {
    inner = `<h2 class="faque-heading">${heading}</h2>
      <div class="faque-items">${questions.map((q: any) => acc(q)).join("\n")}</div>`;

  // ── 10 Dark FAQ ───────────────────────────────────────────────────────────
  } else if (designId === "10") {
    inner = `<h2 class="faque-heading">${heading}</h2>` +
      questions.map((q: any) => acc(q)).join("\n");

  // ── 11 Highlighted Question ───────────────────────────────────────────────
  } else if (designId === "11") {
    const items = questions.map((q: any) =>
      `<div class="faque-item">
        <div class="faque-item-icon">Q</div>
        <div class="faque-item-body">
          <details>
            <summary>${escapeHtml(q.question)}</summary>
            <div class="faque-answer">${escapeHtml(q.answer)}</div>
          </details>
        </div>
      </div>`
    ).join("\n");
    inner = `<h2 class="faque-heading">${heading}</h2>${items}`;

  // ── 12 Borderless FAQ ─────────────────────────────────────────────────────
  } else if (designId === "12") {
    inner = `<h2 class="faque-heading">${heading}</h2>` +
      questions.map((q: any) => acc(q)).join("\n");

  // ── 13 Split FAQ ──────────────────────────────────────────────────────────
  } else if (designId === "13") {
    const qBtns = questions.map((q: any, idx: number) =>
      `<button class="faque-q-btn${idx === 0 ? " active" : ""}"
        data-question="${escapeHtml(q.question)}"
        data-answer="${escapeHtml(q.answer)}">${escapeHtml(q.question)}</button>`
    ).join("\n");
    const firstQ = questions[0] || { question: "", answer: "" };
    inner = `<h2 class="faque-heading">${heading}</h2>
      <div class="faque-layout">
        <div class="faque-questions-list">${qBtns}</div>
        <div class="faque-answer-panel">
          <h3>${escapeHtml(firstQ.question)}</h3>
          <p>${escapeHtml(firstQ.answer)}</p>
        </div>
      </div>`;

  // ── 14 Timeline FAQ ───────────────────────────────────────────────────────
  } else if (designId === "14") {
    const items = questions.map((q: any) =>
      `<div class="faque-item">
        <details>
          <summary>${escapeHtml(q.question)}</summary>
          <div class="faque-answer">${escapeHtml(q.answer)}</div>
        </details>
      </div>`
    ).join("\n");
    inner = `<h2 class="faque-heading">${heading}</h2>
      <div class="faque-timeline">${items}</div>`;

  // ── 15 Compact FAQ ────────────────────────────────────────────────────────
  } else if (designId === "15") {
    inner = `<h2 class="faque-heading">${heading}</h2>` +
      questions.map((q: any) => acc(q)).join("\n");

  } else {
    inner = `<h2 class="faque-heading">${heading}</h2>` +
      questions.map((q: any) => acc(q)).join("\n");
  }

  const embeddedScript = `
  <script>
    (function() {
      var container = document.currentScript.parentElement;
      
      // Design 05: Category Tabs
      var d05Tabs = container.querySelectorAll(".faque-tab-btn");
      if (d05Tabs.length > 0) {
        var items = container.querySelectorAll("details.faque-item");
        d05Tabs.forEach(function(tab) {
          tab.addEventListener("click", function() {
            d05Tabs.forEach(function(t) { t.classList.remove("active"); });
            tab.classList.add("active");
            var cat = tab.dataset.category || "All";
            items.forEach(function(item) {
              item.classList.toggle("visible", cat === "All" || item.dataset.category === cat);
            });
          });
        });
        // Initial trigger
        if(d05Tabs[0]) d05Tabs[0].click();
      }

      // Design 06: Sidebar FAQ
      var d06Tabs = container.querySelectorAll(".faque-cat-btn");
      if (d06Tabs.length > 0) {
        var items = container.querySelectorAll("details.faque-item");
        d06Tabs.forEach(function(tab) {
          tab.addEventListener("click", function() {
            d06Tabs.forEach(function(t) { t.classList.remove("active"); });
            tab.classList.add("active");
            var cat = tab.dataset.category || "All";
            items.forEach(function(item) {
              item.style.display = (cat === "All" || item.dataset.category === cat) ? "" : "none";
            });
          });
        });
        if(d06Tabs[0]) d06Tabs[0].click();
      }

      // Design 07: Search FAQ
      var searchInput = container.querySelector(".faque-search");
      if (searchInput) {
        var items = container.querySelectorAll("details.faque-item");
        searchInput.addEventListener("input", function() {
          var query = this.value.toLowerCase().trim();
          items.forEach(function(item) {
            var text = item.textContent.toLowerCase();
            item.style.display = (!query || text.includes(query)) ? "" : "none";
          });
        });
      }

      // Design 13: Split FAQ
      var d13Btns = container.querySelectorAll(".faque-q-btn");
      if (d13Btns.length > 0) {
        var answerPanel = container.querySelector(".faque-answer-panel");
        var h3 = answerPanel ? answerPanel.querySelector("h3") : null;
        var p = answerPanel ? answerPanel.querySelector("p") : null;
        
        d13Btns.forEach(function(btn) {
          btn.addEventListener("click", function() {
            d13Btns.forEach(function(b) { b.classList.remove("active"); });
            btn.classList.add("active");
            if (h3) h3.textContent = btn.dataset.question || "";
            if (p) p.innerHTML = btn.dataset.answer || ""; 
          });
        });
        if(d13Btns[0]) d13Btns[0].click();
      }
    })();
  </script>`;

  // Embed CSS + scoped root wrapper + Script so it's fully self-contained!
  return \`\${FAQUE_CSS}<div class="faque-root faque-d\${designId}">\${inner}\${embeddedScript}</div>\`;
}

/** Minimal HTML escape to prevent XSS */
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
