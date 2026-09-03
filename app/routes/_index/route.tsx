import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function LandingPage() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f8fafc",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Single Decent Static Card Section */}
      <div
        style={{
          maxWidth: "440px",
          width: "100%",
          background: "#1e293b",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          padding: "40px 32px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
            border: "2px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <img
            src="/faque-logo-1200x1200.jpg"
            alt="Faque Logo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Heading */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "800", color: "#ffffff" }}>
            Faque
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: "1.5" }}>
            Beautiful FAQ sections for your Shopify store. Zero coding required.
          </p>
        </div>

        {/* Login Form */}
        {showForm && (
          <Form method="post" action="/auth/login" style={{ width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#cbd5e1" }}>
                Store Domain
              </label>
              <input
                type="text"
                name="shop"
                placeholder="my-store.myshopify.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#5c6ac4",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  marginTop: "4px",
                  transition: "background 0.2s",
                }}
              >
                Log in / Install App →
              </button>
            </div>
          </Form>
        )}

        {/* Static Feature Highlights */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "16px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          <span>🎨 15 Designs</span>
          <span>•</span>
          <span>⚡ Theme Extension</span>
          <span>•</span>
          <span>📱 Mobile Ready</span>
        </div>
      </div>
    </div>
  );
}
