import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  TextField,
  Button,
  Select,
  Divider,
  Badge,
  InlineStack,
  Banner,
  ChoiceList,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useLoaderData } from "react-router";
import { useState, useCallback } from "react";

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
import { getSubscription } from "../models/Subscription.server";
import prisma from "../db.server";

import { DESIGN_REGISTRY } from "../designs/registry";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const subscription = await getSubscription(session.shop);
  const faqCount = await prisma.fAQ.count({ where: { shop: session.shop } });
  const questionCount = await prisma.question.count({
    where: { faq: { shop: session.shop } },
  });
  return {
    shop: session.shop,
    subscription,
    faqCount,
    questionCount,
  };
};

export default function Settings() {
  const { shop, subscription, faqCount, questionCount } =
    useLoaderData<typeof loader>();

  const [saved, setSaved] = useState(false);
  const [defaultDesign, setDefaultDesign] = useState("01");
  const [branding, setBranding] = useState("show");

  const currentPlan = subscription?.plan || "Free";
  const planLevels: Record<string, number> = { Free: 1, Simple: 2, Pro: 3, Ultimate: 4 };
  const unlockedDesignsCount = DESIGN_REGISTRY.filter(
    (d) => (planLevels[d.planRequired] || 1) <= (planLevels[currentPlan] || 1)
  ).length;

  const handleSave = useCallback(async () => {
    // In a real app, save to a settings metaobject or DB record
    shopify.toast.show("Settings saved!");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [defaultDesign, branding]);

  return (
    <Page
      title="Settings"
      primaryAction={{
        content: "Save Settings",
        onAction: handleSave,
      }}
    >
      <BlockStack gap="500">
        {/* Account Overview */}
        <Layout>
          <Layout.Section variant="oneThird">
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Account Overview
              </Text>
              <Text as="p" tone="subdued">
                Your current plan and usage stats.
              </Text>
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">
                      CURRENT PLAN
                    </Text>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="h3" variant="headingLg">
                        {currentPlan}
                      </Text>
                      <Badge tone="success">Active</Badge>
                    </InlineStack>
                  </BlockStack>
                  <Button url="/app/billing">Manage Plan</Button>
                </InlineStack>

                <Divider />

                <InlineStack gap="600">
                  <BlockStack gap="100">
                    <Text as="p" variant="headingXl">
                      {faqCount}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      FAQ Sections
                    </Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text as="p" variant="headingXl">
                      {questionCount}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Total Questions
                    </Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text as="p" variant="headingXl">
                      {unlockedDesignsCount} / 15
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Designs Unlocked ({currentPlan})
                    </Text>
                  </BlockStack>
                </InlineStack>

                <Divider />

                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">
                    CONNECTED STORE
                  </Text>
                  <Text as="p" fontWeight="semibold">
                    {shop}
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Default Behavior */}
        <Layout>
          <Layout.Section variant="oneThird">
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Default Behavior
              </Text>
              <Text as="p" tone="subdued">
                Set defaults for new FAQ sections you create.
              </Text>
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Select
                  label="Default Design"
                  options={[
                    { label: "01 – Minimal Accordion (Free)", value: "01" },
                    { label: "02 – Modern Cards (Simple+)", value: "02" },
                    { label: "03 – Two Column (Simple+)", value: "03" },
                    { label: "04 – Editorial (Simple+)", value: "04" },
                    { label: "05 – Category Tabs (Simple+)", value: "05" },
                    { label: "06 – Sidebar FAQ (Pro+)", value: "06" },
                    { label: "07 – Search FAQ (Pro+)", value: "07" },
                    { label: "08 – Image + FAQ (Pro+)", value: "08" },
                    { label: "09 – Centered Premium (Pro+)", value: "09" },
                    { label: "10 – Dark FAQ (Ultimate)", value: "10" },
                    { label: "11 – Highlighted Question (Ultimate)", value: "11" },
                    { label: "12 – Borderless FAQ (Ultimate)", value: "12" },
                    { label: "13 – Split FAQ (Ultimate)", value: "13" },
                    { label: "14 – Timeline FAQ (Ultimate)", value: "14" },
                    { label: "15 – Compact FAQ (Ultimate)", value: "15" },
                  ]}
                  value={defaultDesign}
                  onChange={setDefaultDesign}
                  helpText="New FAQ sections will use this design by default."
                />
                <ChoiceList
                  title="Faque Branding"
                  choices={[
                    {
                      label: "Show 'Powered by Faque' footer",
                      value: "show",
                    },
                    {
                      label: "Hide branding (Simple plan and above)",
                      value: "hide",
                      helpText:
                        subscription?.plan === "Free"
                          ? "Upgrade to Simple or above to hide branding."
                          : undefined,
                    },
                  ]}
                  selected={[branding]}
                  onChange={(v) => setBranding(v[0])}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Theme Integration */}
        <Layout>
          <Layout.Section variant="oneThird">
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Theme Integration
              </Text>
              <Text as="p" tone="subdued">
                Add the Faque block to your Shopify theme to display FAQs on
                your storefront.
              </Text>
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Banner tone="info">
                  <p>
                    To display your FAQs on your store, you need to add the{" "}
                    <strong>Faque Section</strong> block in your Shopify Theme
                    Editor.
                  </p>
                </Banner>

                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    How to add Faque to your store:
                  </Text>
                  <ol
                    style={{
                      marginLeft: "20px",
                      lineHeight: "2",
                      color: "#637381",
                    }}
                  >
                    <li>
                      Go to <strong>Online Store → Themes → Customize</strong>
                    </li>
                    <li>
                      Navigate to the page where you want to show FAQs (e.g.,
                      your homepage or a dedicated FAQ page)
                    </li>
                    <li>
                      Click <strong>Add section</strong> and search for{" "}
                      <strong>"Faque"</strong>
                    </li>
                    <li>Select your FAQ, choose colors, and click Save</li>
                  </ol>
                </BlockStack>

                <Button
                  url={`https://${shop}/admin/themes/current/editor`}
                  external
                  variant="primary"
                >
                  Open Theme Editor →
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Danger Zone */}
        <Layout>
          <Layout.Section variant="oneThird">
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd" tone="critical">
                Danger Zone
              </Text>
              <Text as="p" tone="subdued">
                Irreversible actions. Proceed with caution.
              </Text>
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="h3" variant="headingSm">
                      Delete all FAQ data
                    </Text>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Permanently removes all your FAQs, questions, and
                      settings. This cannot be undone.
                    </Text>
                  </BlockStack>
                  <Button
                    tone="critical"
                    onClick={() =>
                      shopify.toast.show(
                        "Contact support to delete all data.",
                        { isError: true }
                      )
                    }
                  >
                    Delete all data
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
