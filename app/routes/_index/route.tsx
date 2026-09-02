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
        background: "linear-gradient(135deg, #0b0f19 0%, #111827 50%, #0f172a 100%)",
        color: "#f8fafc",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* Container */}
      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            position: "relative",
            width: "120px",
            height: "120px",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow:
              "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(92, 106, 196, 0.4)",
            border: "2px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <img
            src="/faque-logo-1200x1200.jpg"
            alt="Faque App Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Hero Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(92, 106, 196, 0.15)",
              border: "1px solid rgba(92, 106, 196, 0.3)",
              fontSize: "13px",
              fontWeight: "600",
              color: "#a5b4fc",
              letterSpacing: "0.5px",
              margin: "0 auto",
            }}
          >
            ✦ SHOPIFY FAQ BUILDER
          </div>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "800",
              margin: 0,
              lineHeight: "1.15",
              background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Beautiful FAQs. Zero Coding.
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              color: "#94a3b8",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Build stunning, conversion-focused FAQ sections for your Shopify store.
            Choose from 15 curated designs and customize in seconds.
          </p>
        </div>

        {/* Login Form Card */}
        {showForm && (
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Form method="post" action="/auth/login">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  textAlign: "left",
                }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#e2e8f0",
                  }}
                >
                  Enter your Shopify store domain
                </label>
                <input
                  type="text"
                  name="shop"
                  placeholder="my-store.myshopify.com"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    background: "rgba(15, 23, 42, 0.8)",
                    color: "white",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                >
                  Install or Log in to Store →
                </button>
              </div>
            </Form>
          </div>
        )}

        {/* Feature Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            width: "100%",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              background: "rgba(30, 41, 59, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "20px",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎨</div>
            <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700" }}>
              15 Premium Designs
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" }}>
              Accordions, Modern Cards, Dark Mode, Sidebar, Search, and Timeline layouts.
            </p>
          </div>

          <div
            style={{
              background: "rgba(30, 41, 59, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "20px",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚡</div>
            <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700" }}>
              Instant Integration
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" }}>
              Add directly from Shopify Theme Editor with a single click. Zero liquid code.
            </p>
          </div>

          <div
            style={{
              background: "rgba(30, 41, 59, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "20px",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>📱</div>
            <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700" }}>
              100% Responsive
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" }}>
              Looks stunning on Desktop, Tablet, and Mobile screens automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
