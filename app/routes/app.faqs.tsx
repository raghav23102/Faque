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
  Modal,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, useRevalidator } from "react-router";
import prisma from "../db.server";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { DESIGN_REGISTRY } from "../designs/registry";
import { getSubscription } from "../models/Subscription.server";
import { useState, useCallback } from "react";

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [faqs, subscription] = await Promise.all([
    prisma.fAQ.findMany({
      where: { shop: session.shop },
      include: { _count: { select: { questions: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    getSubscription(session.shop),
  ]);
  return { faqs, subscription };
};

const categoryColor: Record<string, string> = {
  Minimal: "info",
  Modern: "success",
  Creative: "warning",
  Premium: "magic",
};

const planLevels: Record<string, number> = {
  Free: 1, Simple: 2, Pro: 3, Ultimate: 4,
};

export default function FAQs() {
  const { faqs, subscription } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const currentPlan = subscription?.plan || "Free";

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token = await shopify.idToken();
      const response = await fetch("/api/faqs/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ faqId: deleteTarget.id }),
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error);
      shopify.toast.show(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      revalidator.revalidate();
    } catch (err: any) {
      shopify.toast.show(err.message || "Failed to delete.", { isError: true });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, revalidator]);

  return (
    <Page
      title="FAQs"
      primaryAction={{
        content: "Create FAQ",
        onAction: () => navigate("/app/faqs/new"),
      }}
    >
      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        primaryAction={{
          content: "Delete",
          destructive: true,
          loading: isDeleting,
          onAction: handleDeleteConfirm,
        }}
        secondaryActions={[{ content: "Cancel", onAction: () => setDeleteTarget(null) }]}
      >
        <Modal.Section>
          <Text as="p">
            This will permanently delete the FAQ and all its questions. This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>

      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card padding="0">
              {faqs.length === 0 ? (
                <EmptyState
                  heading="Create your first FAQ"
                  action={{ content: "Create FAQ", onAction: () => navigate("/app/faqs/new") }}
                  secondaryAction={{ content: "Browse designs", onAction: () => navigate("/app/designs") }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Add a beautiful FAQ section to your store. Choose from 15 designs to match your brand.</p>
                </EmptyState>
              ) : (
                <div>
                  {faqs.map((item, idx) => {
                    const { id, name, designId, _count, heading } = item;
                    const design = DESIGN_REGISTRY.find((d) => d.id === designId);
                    return (
                      <div
                        key={id}
                        style={{
                          padding: "16px 20px",
                          borderBottom: idx < faqs.length - 1 ? "1px solid #f1f3f5" : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "16px",
                        }}
                      >
                        {/* Left — Info */}
                        <div
                          style={{ flex: 1, cursor: "pointer", minWidth: 0 }}
                          onClick={() => navigate(`/app/faqs/${id}`)}
                        >
                          <BlockStack gap="100">
                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                              {name}
                            </Text>
                            <Text as="p" tone="subdued" variant="bodySm">
                              {heading}
                            </Text>
                            <InlineStack gap="200" blockAlign="center">
                              <Badge>{`${_count.questions} questions`}</Badge>
                              {design && (
                                <Badge tone={(categoryColor[design.category] as any) || "info"}>
                                  {design.name}
                                </Badge>
                              )}
                            </InlineStack>
                          </BlockStack>
                        </div>

                        {/* Right — Action buttons (always visible, no hover needed) */}
                        <InlineStack gap="200" blockAlign="center">
                          <Button
                            size="slim"
                            onClick={() => navigate(`/app/preview?faqId=${id}`)}
                          >
                            Preview
                          </Button>
                          <Button
                            size="slim"
                            variant="primary"
                            onClick={() => navigate(`/app/faqs/${id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="slim"
                            tone="critical"
                            onClick={() => setDeleteTarget({ id, name })}
                          >
                            Delete
                          </Button>
                        </InlineStack>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </Layout.Section>

          {/* Designs sidebar */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Available Designs</Text>
                  <Badge>{`${DESIGN_REGISTRY.length} total`}</Badge>
                </InlineStack>
                <Text as="p" tone="subdued" variant="bodySm">
                  Your plan ({currentPlan}) unlocks{" "}
                  {DESIGN_REGISTRY.filter(
                    (d) => (planLevels[d.planRequired] || 1) <= (planLevels[currentPlan] || 1)
                  ).length}{" "}
                  designs.
                </Text>
                <Divider />
                <BlockStack gap="200">
                  {DESIGN_REGISTRY.slice(0, 7).map((design) => {
                    const unlocked =
                      (planLevels[currentPlan] || 1) >= (planLevels[design.planRequired] || 1);
                    return (
                      <InlineStack key={design.id} align="space-between" blockAlign="center">
                        <BlockStack gap="0">
                          <Text as="p" variant="bodySm" fontWeight="semibold">{design.name}</Text>
                          <Text as="p" variant="bodySm" tone="subdued">{design.category}</Text>
                        </BlockStack>
                        {unlocked ? (
                          <Badge tone="success">Unlocked</Badge>
                        ) : (
                          <Badge tone="warning">{`${design.planRequired}+`}</Badge>
                        )}
                      </InlineStack>
                    );
                  })}
                </BlockStack>
                <Button fullWidth onClick={() => navigate("/app/designs")}>
                  {`See all ${DESIGN_REGISTRY.length} designs`}
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
