import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider, Banner, Card, Page, BlockStack, Button, Text } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import enTranslations from "@shopify/polaris/locales/en.json";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await authenticate.admin(request);
    return { apiKey: process.env.SHOPIFY_API_KEY || "dafbfec9f51776f79863a71093d0538a" };
  } catch (error: any) {
    if (error instanceof Response || error?.status || error?.headers) {
      throw error;
    }
    console.error("DEBUG - app.tsx loader error:", error);
    throw error;
  }
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Dashboard</s-link>
        <s-link href="/app/faqs">FAQs</s-link>
        <s-link href="/app/designs">Designs</s-link>
        <s-link href="/app/billing">Billing & Plans</s-link>
        <s-link href="/app/settings">Settings</s-link>
      </s-app-nav>
      <PolarisAppProvider i18n={enTranslations}>
        <Outlet />
      </PolarisAppProvider>
    </AppProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError() as any;
  console.error("App Route Error Boundary:", error);

  const shopifyError = boundary.error(error);
  if (shopifyError) {
    return shopifyError;
  }

  return (
    <PolarisAppProvider i18n={enTranslations}>
      <Page title="Authentication Required">
        <Card>
          <BlockStack gap="400">
            <Banner tone="warning" title="Session Expired or Store Not Authenticated">
              <p>
                Your session has expired or this store needs to complete authentication.
              </p>
            </Banner>
            <Text as="p" tone="subdued">
              Click below to re-authenticate Faque with your Shopify store.
            </Text>
            <Button variant="primary" url="/auth/login">
              Re-authenticate Store →
            </Button>
          </BlockStack>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
