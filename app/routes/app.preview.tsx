import { Page, Layout, Card, Text, BlockStack, Select } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import prisma from "../db.server";
import { LoaderFunctionArgs } from "react-router";
import { DESIGN_REGISTRY } from "../designs/registry";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const faqId = url.searchParams.get("faqId");
  
  const faqs = await prisma.fAQ.findMany({
    where: { shop: session.shop },
    select: { id: true, name: true }
  });

  let activeFaq = null;
  if (faqId) {
    activeFaq = await prisma.fAQ.findUnique({
      where: { id: faqId, shop: session.shop },
      include: { questions: { orderBy: { position: 'asc' } } }
    });
  }

  return { faqs, activeFaq };
};

function FaqPreviewRenderer({ faq, deviceView }: { faq: any, deviceView: string }) {
  const isMobile = deviceView === "mobile";
  const isTablet = deviceView === "tablet";
  const designId = faq.designId;

  const [activeCategory, setActiveCategory] = useState("All");

  // Base layout styles
  let containerStyle: React.CSSProperties = {
    fontFamily: ["04", "09", "13"].includes(designId) ? "Georgia, serif" : "sans-serif",
    backgroundColor: designId === "10" ? "#121212" : "transparent",
    color: designId === "10" ? "#fff" : "#1a1a1a",
    padding: isMobile ? "16px" : "32px",
    borderRadius: "12px",
    width: "100%",
    boxSizing: "border-box"
  };

  let headerStyle: React.CSSProperties = {
    textAlign: ["09", "11"].includes(designId) ? "center" : "left",
    fontSize: ["04", "09"].includes(designId) ? "32px" : "24px",
    marginBottom: "24px",
    fontFamily: containerStyle.fontFamily,
    borderBottom: designId === "04" ? "2px solid #000" : "none",
    paddingBottom: designId === "04" ? "16px" : "0",
  };

  let listStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  let itemStyle: React.CSSProperties = {
    padding: "16px 0",
    borderBottom: "1px solid #e1e3e5",
  };

  let questionStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 10px 0",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  };

  let answerStyle: React.CSSProperties = {
    margin: 0,
    color: designId === "10" ? "#aaa" : "#4a4a4a",
    lineHeight: "1.6",
    fontSize: "15px"
  };

  // Specific Design Implementations
  const getDesignContent = () => {
    const questions = faq.questions || [];
    
    // 01 Minimal Accordion (Base)
    if (designId === "01") {
      return questions.map((q: any) => (
        <div key={q.id} style={itemStyle}>
          <div style={questionStyle}>{q.question} <span style={{fontWeight:'normal'}}>+</span></div>
          <div style={answerStyle}>{q.answer}</div>
        </div>
      ));
    }

    // 02 Modern Cards
    if (designId === "02") {
      listStyle.gap = "20px";
      return questions.map((q: any) => (
        <div key={q.id} style={{ padding: "20px", backgroundColor: "#fff", border: "1px solid #e8e8e8", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{...questionStyle, color: '#005bd3'}}>{q.question}</div>
          <div style={answerStyle}>{q.answer}</div>
        </div>
      ));
    }

    // 03 Two Column
    if (designId === "03") {
      listStyle.display = "grid";
      listStyle.gridTemplateColumns = isMobile ? "1fr" : "1fr 1fr";
      listStyle.gap = "32px";
      return questions.map((q: any) => (
        <div key={q.id}>
          <div style={{...questionStyle, borderBottom: '2px solid #000', paddingBottom: '8px'}}>{q.question}</div>
          <div style={{...answerStyle, paddingTop: '12px'}}>{q.answer}</div>
        </div>
      ));
    }

    // 04 Editorial
    if (designId === "04") {
      return questions.map((q: any, idx: number) => (
        <div key={q.id} style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #000', padding: '24px 0' }}>
          <div style={{ fontSize: '32px', color: '#ccc', fontWeight: 'bold', lineHeight: '1' }}>
            {(idx + 1).toString().padStart(2, '0')}
          </div>
          <div>
            <div style={{...questionStyle, fontSize: '20px', fontWeight: 'normal'}}>{q.question}</div>
            <div style={answerStyle}>{q.answer}</div>
          </div>
        </div>
      ));
    }

    // Dynamic Categories for 05 and 06
    const categories = Array.from(new Set(questions.map((q: any) => q.category).filter(Boolean)));
    const hasCategories = categories.length > 0;
    const filteredQuestions = activeCategory === "All" ? questions : questions.filter((q: any) => q.category === activeCategory);

    // 05 Category Tabs
    if (designId === "05") {
      return (
        <div>
          {hasCategories && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
              <span onClick={() => setActiveCategory("All")} style={{ padding: '6px 16px', background: activeCategory === "All" ? '#000' : '#f4f6f8', color: activeCategory === "All" ? '#fff' : '#333', borderRadius: '20px', fontSize: '14px', cursor: 'pointer' }}>All</span>
              {categories.map((cat: any) => (
                <span key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '6px 16px', background: activeCategory === cat ? '#000' : '#f4f6f8', color: activeCategory === cat ? '#fff' : '#333', borderRadius: '20px', fontSize: '14px', cursor: 'pointer' }}>{cat}</span>
              ))}
            </div>
          )}
          {filteredQuestions.map((q: any) => (
            <div key={q.id} style={itemStyle}>
              <div style={questionStyle}>{q.question}</div>
              <div style={answerStyle}>{q.answer}</div>
            </div>
          ))}
        </div>
      );
    }

    // 06 Sidebar FAQ
    if (designId === "06") {
      return (
        <div style={{ display: isMobile ? 'block' : 'flex', gap: '48px' }}>
          {!isMobile && hasCategories && (
            <div style={{ width: '250px', flexShrink: 0, borderRight: '1px solid #eee', paddingRight: '24px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '16px' }}>Categories</div>
              <div onClick={() => setActiveCategory("All")} style={{ color: activeCategory === "All" ? '#005bd3' : '#555', marginBottom: '12px', cursor: 'pointer', fontWeight: activeCategory === "All" ? 'bold' : 'normal' }}>All</div>
              {categories.map((cat: any) => (
                <div key={cat} onClick={() => setActiveCategory(cat)} style={{ color: activeCategory === cat ? '#005bd3' : '#555', marginBottom: '12px', cursor: 'pointer', fontWeight: activeCategory === cat ? 'bold' : 'normal' }}>{cat}</div>
              ))}
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredQuestions.map((q: any) => (
              <div key={q.id} style={{ paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                <div style={questionStyle}>{q.question}</div>
                <div style={answerStyle}>{q.answer}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 07 Search FAQ
    if (designId === "07") {
      return (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ padding: '12px 16px', border: '1px solid #ccc', borderRadius: '4px', color: '#888', background: '#fff' }}>
              🔍 Search for answers...
            </div>
          </div>
          {questions.map((q: any) => (
            <div key={q.id} style={itemStyle}>
              <div style={questionStyle}>{q.question}</div>
              <div style={answerStyle}>{q.answer}</div>
            </div>
          ))}
        </div>
      );
    }

    // 08 Image + FAQ
    if (designId === "08") {
      let imageUrl = "";
      try { imageUrl = JSON.parse(faq.settings || "{}").imageUrl; } catch(e) {}
      if (!imageUrl) imageUrl = "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png";

      return (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px', alignItems: 'start' }}>
          <div style={{ width: '100%', height: '300px', backgroundColor: '#e8e8e8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', overflow: 'hidden' }}>
            <img src={imageUrl} alt="FAQ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            {questions.map((q: any) => (
              <div key={q.id} style={itemStyle}>
                <div style={questionStyle}>{q.question}</div>
                <div style={answerStyle}>{q.answer}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 09 Centered Premium
    if (designId === "09") {
      return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {questions.map((q: any) => (
            <div key={q.id} style={{ textAlign: 'center', padding: '24px 0', borderBottom: '1px solid #eaeaea' }}>
              <div style={{...questionStyle, justifyContent: 'center', fontSize: '18px'}}>{q.question}</div>
              <div style={{...answerStyle, marginTop: '12px'}}>{q.answer}</div>
            </div>
          ))}
        </div>
      );
    }

    // 10 Dark FAQ
    if (designId === "10") {
      return questions.map((q: any) => (
        <div key={q.id} style={{ padding: '16px', backgroundColor: '#222', borderRadius: '8px', marginBottom: '12px', border: '1px solid #333' }}>
          <div style={{...questionStyle, color: '#fff'}}>{q.question} <span style={{color: '#00ffaa'}}>+</span></div>
          <div style={answerStyle}>{q.answer}</div>
        </div>
      ));
    }

    // 11 Highlighted Question
    if (designId === "11") {
      return questions.map((q: any, idx: number) => (
        <div key={q.id} style={{ padding: '24px', backgroundColor: idx === 0 ? '#f0f7ff' : '#fff', borderLeft: idx === 0 ? '4px solid #005bd3' : '4px solid transparent', borderBottom: '1px solid #eee' }}>
          <div style={{...questionStyle, fontSize: idx === 0 ? '20px' : '16px', color: idx === 0 ? '#005bd3' : '#333'}}>{q.question}</div>
          <div style={answerStyle}>{q.answer}</div>
        </div>
      ));
    }

    // 12 Borderless
    if (designId === "12") {
      return questions.map((q: any) => (
        <div key={q.id} style={{ padding: '12px 0', marginBottom: '16px' }}>
          <div style={{...questionStyle, fontSize: '18px'}}>{q.question}</div>
          <div style={answerStyle}>{q.answer}</div>
        </div>
      ));
    }

    // 13 Split FAQ
    if (designId === "13") {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px' }}>
          <div>
            {questions.map((q: any, idx: number) => (
              <div key={q.id} style={{ padding: '16px', cursor: 'pointer', fontWeight: idx === 0 ? 'bold' : 'normal', color: idx === 0 ? '#000' : '#888', borderLeft: idx === 0 ? '3px solid #000' : '3px solid transparent' }}>
                {q.question}
              </div>
            ))}
          </div>
          {!isMobile && questions[0] && (
            <div style={{ padding: '24px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>{questions[0].question}</div>
              <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#444' }}>{questions[0].answer}</div>
            </div>
          )}
        </div>
      );
    }

    // 14 Timeline FAQ
    if (designId === "14") {
      return (
        <div style={{ position: 'relative', paddingLeft: '24px' }}>
          <div style={{ position: 'absolute', left: '7px', top: '0', bottom: '0', width: '2px', backgroundColor: '#eaeaea' }}></div>
          {questions.map((q: any, idx: number) => (
            <div key={q.id} style={{ position: 'relative', marginBottom: '32px' }}>
              <div style={{ position: 'absolute', left: '-24px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#005bd3', border: '3px solid #fff' }}></div>
              <div style={questionStyle}>{q.question}</div>
              <div style={answerStyle}>{q.answer}</div>
            </div>
          ))}
        </div>
      );
    }

    // 15 Compact FAQ
    if (designId === "15") {
      return questions.map((q: any) => (
        <div key={q.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{q.question}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>{q.answer}</div>
        </div>
      ));
    }

    // Fallback
    return questions.map((q: any) => (
      <div key={q.id} style={itemStyle}>
        <div style={questionStyle}>{q.question}</div>
        <div style={answerStyle}>{q.answer}</div>
      </div>
    ));
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>{faq.heading}</h2>
      <div style={listStyle}>
        {getDesignContent()}
      </div>
    </div>
  );
}

export default function Preview() {
  const { faqs, activeFaq } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [deviceView, setDeviceView] = useState("desktop");

  const faqOptions = faqs.map(f => ({ label: f.name, value: f.id }));
  
  const handleFaqChange = (value: string) => {
    setSearchParams({ faqId: value });
  };

  const previewWidth = deviceView === "desktop" ? "100%" : deviceView === "tablet" ? "768px" : "375px";

  return (
    <Page title="Live Preview">
      <BlockStack gap="400">
        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Select
                  label="Select FAQ to Preview"
                  options={[{label: 'Choose an FAQ...', value: ''}, ...faqOptions]}
                  onChange={handleFaqChange}
                  value={activeFaq?.id || ''}
                />
                
                <Select
                  label="Device View"
                  options={[
                    {label: 'Desktop', value: 'desktop'},
                    {label: 'Tablet', value: 'tablet'},
                    {label: 'Mobile', value: 'mobile'},
                  ]}
                  onChange={setDeviceView}
                  value={deviceView}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card padding="0">
              <div style={{ padding: '20px', borderBottom: '1px solid #e1e3e5', backgroundColor: '#f4f6f8' }}>
                <Text as="h3" variant="headingMd">Preview Window</Text>
              </div>
              <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', backgroundColor: '#e4e5e7', minHeight: '500px' }}>
                <div style={{ 
                  width: previewWidth, 
                  backgroundColor: activeFaq?.designId === "10" ? '#1a1a1a' : 'white', 
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  transition: 'width 0.3s ease',
                  padding: '20px',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {!activeFaq ? (
                    <Text as="p" alignment="center" tone="subdued">Select an FAQ to preview</Text>
                  ) : activeFaq.questions.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>No questions added yet.</p>
                  ) : (
                    <FaqPreviewRenderer faq={activeFaq} deviceView={deviceView} />
                  )}
                </div>
              </div>
              {activeFaq && (
                <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#999', backgroundColor: '#f4f6f8' }}>
                  Active Design: {DESIGN_REGISTRY.find(d => d.id === activeFaq.designId)?.name || activeFaq.designId}
                </div>
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
