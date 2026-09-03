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
  Box,
  Icon,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "react-router";
import prisma from "../db.server";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getSubscription, updateSubscription } from "../models/Subscription.server";

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
import { DESIGN_REGISTRY } from "../designs/registry";
import { useState, useCallback } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  
  let currentPlan = "Free";
  try {
    const { hasActivePayment, appSubscriptions } = await (billing as any).check({
      plans: ["Simple", "Pro", "Ultimate"],
      isTest: false,
    });
    if (hasActivePayment && appSubscriptions.length > 0) {
      currentPlan = appSubscriptions[0].name;
    }
  } catch (err) {
    console.error("Error checking billing:", err);
  }

  // Sync with local database
  const subscription = await getSubscription(session.shop);
  if (subscription.plan !== currentPlan) {
    await updateSubscription(session.shop, currentPlan);
    subscription.plan = currentPlan;
  }

  return { subscription, shop: session.shop };
};

const PLANS = [
  {
    id: "Free",
    name: "Free",
    price: 0,
    badge: null,
    color: "#f4f6f8",
    features: [
      "1 FAQ section",
      "Unlimited questions",
      "1 design (Minimal Accordion)",
      "Basic support",
    ],
    designs: DESIGN_REGISTRY.filter((d) => d.planRequired === "Free").length,
    limit: "1 FAQ",
  },
  {
    id: "Simple",
    name: "Simple",
    price: 29,
    badge: "Popular",
    color: "#e3f0ff",
    features: [
      "5 FAQ sections",
      "Unlimited questions",
      "5 designs unlocked",
      "Priority email support",
      "Custom heading & description",
    ],
    designs: DESIGN_REGISTRY.filter(
      (d) => d.planRequired === "Simple" || d.planRequired === "Free"
    ).length,
    limit: "5 FAQs",
  },
  {
    id: "Pro",
    name: "Pro",
    price: 79,
    badge: "Best Value",
    color: "#f0e6ff",
    features: [
      "Unlimited FAQ sections",
      "Unlimited questions",
      "9 designs unlocked",
      "Search & sidebar designs",
      "Priority support",
      "Analytics (coming soon)",
    ],
    designs: DESIGN_REGISTRY.filter(
      (d) =>
        d.planRequired === "Pro" ||
        d.planRequired === "Simple" ||
        d.planRequired === "Free"
    ).length,
    limit: "Unlimited FAQs",
  },
  {
    id: "Ultimate",
    name: "Ultimate",
    price: 119,
    badge: "All Features",
    color: "#fff3e0",
    features: [
      "Everything in Pro",
      "All 15 designs unlocked",
      "Dark mode & premium themes",
      "Timeline & split layouts",
      "Dedicated support",
      "Early access to new features",
    ],
    designs: DESIGN_REGISTRY.length,
    limit: "Unlimited FAQs",
  },
];

export default function Billing() {
  const { subscription } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = subscription?.plan || "Free";

  const handleUpgrade = useCallback(
    async (planId: string) => {
      if (planId === currentPlan) return;
      setLoading(planId);
      try {
        const token = await shopify.idToken();
        const resp = await fetch("/api/billing/subscribe", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan: planId }),
        });
        const data = await resp.json();
        if (data.confirmationUrl) {
          // Redirect to Shopify billing confirmation page
          window.top!.location.href = data.confirmationUrl;
        } else if (data.error) {
          shopify.toast.show(data.error, { isError: true });
        }
      } catch (e: any) {
        shopify.toast.show("Failed to start upgrade. Please try again.", {
          isError: true,
        });
      } finally {
        setLoading(null);
      }
    },
    [currentPlan]
  );

  return (
    <Page title="Billing & Plans">
      <BlockStack gap="600">
        {/* Current Plan Banner */}
        <Card>
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">
                Current Plan
              </Text>
              <InlineStack gap="200" blockAlign="center">
                <Text as="p" variant="headingXl">
                  {currentPlan}
                </Text>
                <Badge tone={currentPlan === "Free" ? "info" : "success"}>
                  Active
                </Badge>
              </InlineStack>
              <Text as="p" tone="subdued">
                {currentPlan === "Free"
                  ? "You are on the free plan. Upgrade to unlock more designs."
                  : `$${PLANS.find((p) => p.id === currentPlan)?.price}/month`}
              </Text>
            </BlockStack>
            <Button onClick={() => navigate("/app/designs")}>
              Browse Designs
            </Button>
          </InlineStack>
        </Card>

        {/* Plan Cards — single horizontal row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            alignItems: "stretch",
          }}
        >
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const planLevels: Record<string, number> = {
              Free: 1,
              Simple: 2,
              Pro: 3,
              Ultimate: 4,
            };
            const isUpgrade =
              planLevels[plan.id] > planLevels[currentPlan];

            return (
              <div
                key={plan.id}
                style={{
                  border: isCurrentPlan
                    ? "2px solid #008060"
                    : "1px solid #e1e3e5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: isCurrentPlan
                    ? "0 4px 16px rgba(0,128,96,0.15)"
                    : "none",
                }}
              >
                {isCurrentPlan && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      background: "#008060",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "bold",
                      padding: "3px",
                    }}
                  >
                    YOUR PLAN
                  </div>
                )}

                {/* Plan header */}
                <div
                  style={{
                    background: plan.color,
                    padding: isCurrentPlan ? "30px 20px 20px" : "20px",
                    position: "relative",
                  }}
                >
                  {plan.badge && !isCurrentPlan && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                    >
                      <Badge
                        tone={
                          plan.badge === "Popular"
                            ? "info"
                            : plan.badge === "Best Value"
                              ? "success"
                              : "warning"
                        }
                      >
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <Text as="h3" variant="headingMd">
                    {plan.name}
                  </Text>
                  <div style={{ marginTop: "8px" }}>
                    {plan.price === 0 ? (
                      <Text as="p" variant="headingXl">
                        Free
                      </Text>
                    ) : (
                      <InlineStack gap="100" blockAlign="baseline">
                        <Text as="p" variant="headingXl">
                          ${plan.price}
                        </Text>
                        <Text as="p" tone="subdued">
                          /mo
                        </Text>
                      </InlineStack>
                    )}
                  </div>
                  <Text as="p" tone="subdued" variant="bodySm">
                    {plan.limit} · {plan.designs} designs
                  </Text>
                </div>

                {/* Features */}
                <div
                  style={{
                    padding: "20px",
                    background: "white",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <BlockStack gap="200">
                    {plan.features.map((f, i) => (
                      <InlineStack key={i} gap="200" blockAlign="center">
                        <span style={{ color: "#008060", fontSize: "14px" }}>✓</span>
                        <Text as="p" variant="bodySm">
                          {f}
                        </Text>
                      </InlineStack>
                    ))}
                  </BlockStack>

                  <div style={{ marginTop: "16px" }}>
                    {isCurrentPlan ? (
                      <Button disabled fullWidth>
                        Current Plan
                      </Button>
                    ) : plan.id === "Free" ? (
                      <Button
                        fullWidth
                        loading={loading === plan.id}
                        onClick={() => handleUpgrade("Free")}
                      >
                        Downgrade to Free
                      </Button>
                    ) : (
                      <Button
                        variant={isUpgrade ? "primary" : undefined}
                        fullWidth
                        loading={loading === plan.id}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {isUpgrade
                          ? `Upgrade to ${plan.name}`
                          : `Switch to ${plan.name}`}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature comparison */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              What's included in each plan
            </Text>
            <Divider />
            <Layout>
              <Layout.Section variant="oneThird">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    🎨 Designs
                  </Text>
                  <Text as="p" tone="subdued">
                    Each plan unlocks more of our 15 premium FAQ designs. Free
                    starts with the clean Minimal Accordion. Ultimate unlocks
                    everything including dark mode, split, and timeline layouts.
                  </Text>
                </BlockStack>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    📋 FAQ Sections
                  </Text>
                  <Text as="p" tone="subdued">
                    Free plan supports 1 FAQ section. Simple supports up to 5.
                    Pro and Ultimate give you unlimited FAQ sections to organize
                    content for different pages or products.
                  </Text>
                </BlockStack>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    💬 Support
                  </Text>
                  <Text as="p" tone="subdued">
                    All plans include community support. Simple and above get
                    priority email support. Ultimate gets dedicated support with
                    faster response times.
                  </Text>
                </BlockStack>
              </Layout.Section>
            </Layout>
          </BlockStack>
        </Card>

        <Text as="p" tone="subdued" alignment="center">
          All plans are billed monthly through Shopify. Cancel any time.
          Upgrades take effect immediately.
        </Text>
      </BlockStack>
    </Page>
  );
}
