import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Button,
  Divider,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "react-router";
import prisma from "../db.server";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getSubscription } from "../models/Subscription.server";
import { DESIGN_REGISTRY } from "../designs/registry";

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let session;
  try {
    const authResult = await authenticate.admin(request);
    session = authResult.session;
  } catch (error: any) {
    if (error instanceof Response || error?.status || error?.headers) {
      throw error;
    }
    console.error("app._index authenticate error:", error);
    throw error;
  }

  const shopDomain = session?.shop || "";

  try {
    const [faqs, subscription] = await Promise.all([
      prisma.fAQ.findMany({
        where: { shop: shopDomain },
        include: { _count: { select: { questions: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      getSubscription(shopDomain),
    ]);

    const totalQuestions = faqs.reduce(
      (acc, faq) => acc + faq._count.questions,
      0
    );

    return { faqs, totalQuestions, subscription, shop: shopDomain };
  } catch (dbError) {
    console.error("app._index database error:", dbError);
    return {
      faqs: [],
      totalQuestions: 0,
      subscription: { plan: "Free" },
      shop: shopDomain,
    };
  }
};

export default function Dashboard() {
  const { faqs, totalQuestions, subscription, shop } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const currentPlan = subscription?.plan || "Free";
  const planLevels: Record<string, number> = {
    Free: 1,
    Simple: 2,
    Pro: 3,
    Ultimate: 4,
  };
  const unlockedDesignsCount = DESIGN_REGISTRY.filter(
    (d) => (planLevels[d.planRequired] || 1) <= (planLevels[currentPlan] || 1)
  ).length;

  return (
    <Page
      title="Dashboard"
      primaryAction={{
        content: "Create FAQ",
        onAction: () => navigate("/app/faqs/new"),
      }}
      secondaryActions={[
        {
          content: "Browse Designs",
          onAction: () => navigate("/app/designs"),
        },
      ]}
    >
      <BlockStack gap="500">
        {/* Welcome Header Banner with Logo */}
        <Card padding="500">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="400" blockAlign="center">
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  border: "1px solid #e1e3e5",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/faque-logo-1200x1200.jpg"
                  alt="Faque Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <BlockStack gap="100">
                <InlineStack gap="200" blockAlign="center">
                  <Text as="h1" variant="headingLg">
                    Welcome to Faque
                  </Text>
                  <Badge tone="success">Active</Badge>
                </InlineStack>
                <Text as="p" tone="subdued">
                  Build and customize high-converting FAQ sections for{" "}
                  <strong>{shop}</strong>.
                </Text>
              </BlockStack>
            </InlineStack>

            <InlineStack gap="200">
              <Button onClick={() => navigate("/app/designs")}>
                Browse Designs
              </Button>
              <Button variant="primary" onClick={() => navigate("/app/faqs/new")}>
                + Create FAQ
              </Button>
            </InlineStack>
          </InlineStack>
        </Card>

        {/* Quick Stat Cards */}
        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  TOTAL FAQ SECTIONS
                </Text>
                <Text as="p" variant="headingXl">
                  {faqs.length}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Active sections in store
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  TOTAL QUESTIONS
                </Text>
                <Text as="p" variant="headingXl">
                  {totalQuestions}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Across all FAQ sections
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="bodySm" tone="subdued">
                    DESIGNS UNLOCKED
                  </Text>
                  <Button size="micro" onClick={() => navigate("/app/billing")}>
                    Upgrade
                  </Button>
                </InlineStack>
                <Text as="p" variant="headingXl">
                  {unlockedDesignsCount} / 15
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {currentPlan} Plan
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Recent FAQs Section */}
          <Layout.Section>
            <Card padding="0">
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e1e3e5" }}>
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Recent FAQs
                  </Text>
                  <Button size="slim" onClick={() => navigate("/app/faqs")}>
                    View All
                  </Button>
                </InlineStack>
              </div>

              {faqs.length === 0 ? (
                <EmptyState
                  heading="No FAQs created yet"
                  action={{
                    content: "Create FAQ",
                    onAction: () => navigate("/app/faqs/new"),
                  }}
                  secondaryAction={{
                    content: "Browse designs",
                    onAction: () => navigate("/app/designs"),
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>
                    Create your first FAQ section and customize it with one of
                    our 15 designs.
                  </p>
                </EmptyState>
              ) : (
                <div>
                  {faqs.slice(0, 4).map((faq, idx) => {
                    const design = DESIGN_REGISTRY.find(
                      (d) => d.id === faq.designId
                    );
                    return (
                      <div
                        key={faq.id}
                        style={{
                          padding: "16px 20px",
                          borderBottom:
                            idx < Math.min(faqs.length, 4) - 1
                              ? "1px solid #f1f3f5"
                              : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "16px",
                        }}
                      >
                        <BlockStack gap="100">
                          <Text variant="bodyMd" fontWeight="bold" as="h3">
                            {faq.name}
                          </Text>
                          <InlineStack gap="200" blockAlign="center">
                            <Badge>{faq._count.questions} questions</Badge>
                            {design && (
                              <Badge tone="info">{design.name}</Badge>
                            )}
                          </InlineStack>
                        </BlockStack>

                        <InlineStack gap="200">
                          <Button
                            size="slim"
                            onClick={() =>
                              navigate(`/app/preview?faqId=${faq.id}`)
                            }
                          >
                            Preview
                          </Button>
                          <Button
                            size="slim"
                            variant="primary"
                            onClick={() => navigate(`/app/faqs/${faq.id}`)}
                          >
                            Edit
                          </Button>
                        </InlineStack>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </Layout.Section>

          {/* Quick Start Guide */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  🚀 Quick Start Guide
                </Text>
                <Divider />
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm">
                    <strong>1. Create FAQ Section</strong>
                    <br />
                    Add your questions and answers in the FAQ editor.
                  </Text>
                  <Text as="p" variant="bodySm">
                    <strong>2. Choose a Design</strong>
                    <br />
                    Pick from 15 designs (Accordion, Cards, Dark Mode, etc.).
                  </Text>
                  <Text as="p" variant="bodySm">
                    <strong>3. Add to Theme</strong>
                    <br />
                    Add the Faque Section block inside Shopify Theme Editor.
                  </Text>
                </BlockStack>
                <Button
                  fullWidth
                  url={`https://${shop}/admin/themes/current/editor`}
                  external
                >
                  Open Theme Editor →
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
