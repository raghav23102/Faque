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

  // Base layout styles based on design
  let containerStyle: React.CSSProperties = {
    fontFamily: designId === "04" || designId === "09" ? "Georgia, serif" : "sans-serif",
    backgroundColor: designId === "10" ? "#1a1a1a" : "transparent",
    color: designId === "10" ? "#fff" : "#333",
    padding: "20px",
    borderRadius: "8px",
    width: "100%",
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
    color: designId === "10" ? "#ccc" : "#555",
    lineHeight: "1.6",
    fontSize: "14px"
  };

  // Design-specific overrides
  if (designId === "02" || designId === "11") {
    // Modern Cards
    itemStyle = {
      padding: "20px",
      backgroundColor: designId === "10" ? "#2a2a2a" : "#fff",
      border: "1px solid #e1e3e5",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    };
  }

  if (designId === "03") {
    // Two Column
    listStyle = {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "24px",
    };
    itemStyle = { ...itemStyle, borderBottom: "none" };
  }

  if (designId === "04") {
    // Editorial
    itemStyle = {
      padding: "24px 0",
      borderBottom: "1px solid #000",
      display: "flex",
      gap: "20px"
    };
    questionStyle = { ...questionStyle, fontSize: "20px", fontWeight: "normal" };
  }

  if (designId === "06" || designId === "13") {
    // Sidebar / Split
    listStyle = {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr",
      gap: "40px",
    };
    itemStyle = { ...itemStyle, borderBottom: "none", padding: "10px 0" };
  }

  if (designId === "12") {
    // Borderless
    itemStyle = { ...itemStyle, borderBottom: "none", padding: "12px 0" };
  }

  if (designId === "15") {
    // Compact
    listStyle.gap = "8px";
    itemStyle.padding = "8px 0";
    questionStyle.fontSize = "14px";
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ 
        textAlign: designId === "09" ? 'center' : 'left', 
        fontSize: '24px', 
        marginBottom: '30px',
        fontFamily: containerStyle.fontFamily
      }}>
        {faq.heading}
      </h2>
      
      <div style={listStyle}>
        {faq.questions.map((q: any, idx: number) => (
          <div key={q.id} style={itemStyle}>
            {designId === "04" && (
              <div style={{ fontSize: '24px', color: '#999', fontWeight: 'bold' }}>
                {(idx + 1).toString().padStart(2, '0')}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={questionStyle}>
                {q.question}
                {designId !== "12" && designId !== "13" && <span>+</span>}
              </div>
              <div style={answerStyle}>{q.answer}</div>
            </div>
          </div>
        ))}
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
