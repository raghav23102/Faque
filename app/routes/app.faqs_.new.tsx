import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  BlockStack,
  Text,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useNavigate } from "react-router";
import { LoaderFunctionArgs } from "react-router";
import { useState, useCallback } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function CreateFAQ() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !heading.trim()) {
      setError("Internal Name and FAQ Heading are required.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // shopify.idToken() is the App Bridge global — it returns a short-lived
      // JWT that Shopify's authenticate.admin() accepts via Authorization: Bearer
      const token = await shopify.idToken();

      const body = new FormData();
      body.append("name", name.trim());
      body.append("heading", heading.trim());
      body.append("description", description.trim());

      const response = await fetch("/api/faqs/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      shopify.toast.show("FAQ created successfully!");
      navigate(`/app/faqs/${data.faqId}`);
    } catch (err: any) {
      console.error("Create FAQ failed:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [name, heading, description, navigate]);

  return (
    <Page
      backAction={{ content: "FAQs", url: "/app/faqs" }}
      title="Create new FAQ"
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner tone="critical" onDismiss={() => setError("")}>
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        )}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                FAQ Details
              </Text>
              <FormLayout>
                <TextField
                  label="Internal Name"
                  value={name}
                  onChange={setName}
                  autoComplete="off"
                  helpText="For your own reference (e.g., 'Main Store FAQ'). Not shown to customers."
                />
                <TextField
                  label="FAQ Heading"
                  value={heading}
                  onChange={setHeading}
                  autoComplete="off"
                  helpText="This heading is displayed above your FAQ on the storefront."
                />
                <TextField
                  label="Short Description (Optional)"
                  value={description}
                  onChange={setDescription}
                  autoComplete="off"
                  multiline={3}
                  helpText="Optional subtitle shown below the heading."
                />
                <Button
                  variant="primary"
                  loading={isLoading}
                  onClick={handleSubmit}
                >
                  Create FAQ
                </Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
