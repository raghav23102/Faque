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

export default function Preview() {
  const { faqs, activeFaq } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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
                  backgroundColor: 'white', 
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  transition: 'width 0.3s ease',
                  padding: '20px',
                  borderRadius: '8px'
                }}>
                  {!activeFaq ? (
                    <Text as="p" alignment="center" tone="subdued">Select an FAQ to preview</Text>
                  ) : (
                    <div>
                      <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>{activeFaq.heading}</h2>
                      {activeFaq.questions.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>No questions added yet.</p>
                      ) : (
                        activeFaq.questions.map(q => (
                          <div key={q.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px 0' }}>{q.question}</h3>
                            <p style={{ margin: 0, color: '#555', lineHeight: '1.5' }}>{q.answer}</p>
                          </div>
                        ))
                      )}
                      
                      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
                        Active Design: {DESIGN_REGISTRY.find(d => d.id === activeFaq.designId)?.name || activeFaq.designId}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
