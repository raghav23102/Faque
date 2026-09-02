import { Page, Layout, Card, Text, BlockStack, Button, ResourceList, ResourceItem, Badge } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "react-router";
import prisma from "../db.server";
import { LoaderFunctionArgs } from "react-router";
import { getSubscription } from "../models/Subscription.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const faqs = await prisma.fAQ.findMany({
    where: { shop: session.shop },
    include: { _count: { select: { questions: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });
  
  const totalQuestions = faqs.reduce((acc, faq) => acc + faq._count.questions, 0);
  const subscription = await getSubscription(session.shop);

  return { faqs, totalQuestions, subscription };
};

export default function Dashboard() {
  const { faqs, totalQuestions, subscription } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page title="Welcome to Faque">
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Create beautiful FAQ sections for your Shopify store.</Text>
        
        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">FAQ Sections</Text>
                <Text as="p" variant="headingXl">{faqs.length}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">Total Questions</Text>
                <Text as="p" variant="headingXl">{totalQuestions}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">Current Plan</Text>
                <Text as="p" variant="headingXl">{subscription.plan}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card padding="0">
              <div style={{ padding: '20px', borderBottom: '1px solid #e1e3e5' }}>
                <Text as="h2" variant="headingMd">Recent FAQs</Text>
              </div>
              {faqs.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <Text as="p" variant="bodyMd">No FAQs yet. Create your first FAQ to get started.</Text>
                  <div style={{ marginTop: '10px' }}>
                    <Button variant="primary" onClick={() => navigate('/app/faqs/new')}>Create FAQ</Button>
                  </div>
                </div>
              ) : (
                <ResourceList
                  resourceName={{ singular: 'FAQ', plural: 'FAQs' }}
                  items={faqs}
                  renderItem={(item) => {
                    const { id, name, designId, _count } = item;
                    return (
                      <ResourceItem
                        id={id}
                        url={`/app/faqs/${id}`}
                        accessibilityLabel={`View details for ${name}`}
                        onClick={() => navigate(`/app/faqs/${id}`)}
                      >
                        <Text variant="bodyMd" fontWeight="bold" as="h3">
                          {name}
                        </Text>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                          <Badge>{_count.questions} questions</Badge>
                          <Badge tone="info">Design: {designId}</Badge>
                        </div>
                      </ResourceItem>
                    );
                  }}
                />
              )}
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Quick Start</Text>
                <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li><Text as="span">Create your FAQ from the FAQs page.</Text></li>
                  <li><Text as="span">Choose from 15+ beautiful designs in the Designs tab.</Text></li>
                  <li><Text as="span">Customize your layout and colors.</Text></li>
                  <li><Text as="span">Add the Faque app block to your Shopify theme.</Text></li>
                </ol>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
