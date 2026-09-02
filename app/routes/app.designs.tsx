import {
  Page,
  BlockStack,
  Badge,
  Button,
  Text,
  InlineStack,
  Grid,
} from "@shopify/polaris";
import { DESIGN_REGISTRY, canAccessDesign } from "../designs/registry";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { getSubscription } from "../models/Subscription.server";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const subscription = await getSubscription(session.shop);
  return { plan: subscription.plan };
};

// Visual mini-preview for each design type rendered with pure CSS
function DesignPreview({ designId }: { designId: string }) {
  const styles: React.CSSProperties = {
    width: "100%",
    height: "160px",
    background: "#f9fafb",
    borderRadius: "8px 8px 0 0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px",
    gap: "8px",
    overflow: "hidden",
    position: "relative",
  };

  const lineStyle = (w: string, dark = false): React.CSSProperties => ({
    height: "8px",
    width: w,
    borderRadius: "4px",
    background: dark ? "#c1c5ca" : "#e1e3e5",
  });

  const previewMap: Record<string, React.ReactNode> = {
    "01": ( // Minimal Accordion
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e1e3e5", paddingBottom: "8px" }}>
            <div style={lineStyle(i === 1 ? "60%" : i === 2 ? "75%" : "50%", true)} />
            <span style={{ fontSize: "18px", color: "#8c9196" }}>{i === 1 ? "−" : "+"}</span>
          </div>
        ))}
      </div>
    ),
    "02": ( // Modern Cards
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ background: "white", border: "1px solid #e1e3e5", borderRadius: "8px", padding: "10px", display: "flex", flexDirection: "column", gap: "5px", boxShadow: i === 1 ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}>
            <div style={lineStyle("70%", true)} />
            {i === 1 && <div style={lineStyle("90%")} />}
          </div>
        ))}
      </div>
    ),
    "03": ( // Two Column
      <div style={{ width: "100%", display: "flex", gap: "8px" }}>
        {[1, 2].map((col) => (
          <div key={col} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ borderLeft: "3px solid #5c6ac4", paddingLeft: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={lineStyle("80%", true)} />
                <div style={lineStyle("100%")} />
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
    "04": ( // Editorial
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#5c6ac4", minWidth: "18px" }}>0{i}</span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={lineStyle(i === 2 ? "80%" : "65%", true)} />
              {i === 1 && <div style={lineStyle("100%")} />}
            </div>
          </div>
        ))}
      </div>
    ),
    "05": ( // Category Tabs
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["All", "Shipping", "Returns"].map((tab, i) => (
            <div key={tab} style={{ padding: "4px 10px", borderRadius: "20px", background: i === 0 ? "#5c6ac4" : "#e1e3e5", fontSize: "10px", color: i === 0 ? "white" : "#637381" }}>
              {tab}
            </div>
          ))}
        </div>
        {[1, 2].map((i) => (
          <div key={i} style={{ borderBottom: "1px solid #e1e3e5", paddingBottom: "8px", display: "flex", justifyContent: "space-between" }}>
            <div style={lineStyle(i === 1 ? "65%" : "75%", true)} />
            <span style={{ fontSize: "14px", color: "#8c9196" }}>+</span>
          </div>
        ))}
      </div>
    ),
    "06": ( // Sidebar FAQ
      <div style={{ width: "100%", display: "flex", gap: "10px", height: "120px" }}>
        <div style={{ width: "35%", background: "#f4f6f8", borderRadius: "6px", padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {["General", "Shipping", "Returns"].map((item, i) => (
            <div key={item} style={{ padding: "4px 6px", borderRadius: "4px", background: i === 0 ? "#5c6ac4" : "transparent", fontSize: "9px", color: i === 0 ? "white" : "#637381" }}>
              {item}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ borderBottom: "1px solid #e1e3e5", paddingBottom: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={lineStyle("80%", true)} />
              {i === 1 && <div style={lineStyle("100%")} />}
            </div>
          ))}
        </div>
      </div>
    ),
    "07": ( // Search FAQ
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ border: "2px solid #5c6ac4", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", color: "#8c9196" }}>🔍</span>
          <div style={{ ...lineStyle("50%"), background: "#e1e3e5" }} />
        </div>
        {[1, 2].map((i) => (
          <div key={i} style={{ borderBottom: "1px solid #e1e3e5", paddingBottom: "8px", display: "flex", justifyContent: "space-between" }}>
            <div style={lineStyle(i === 1 ? "60%" : "75%", true)} />
            <span style={{ fontSize: "14px", color: "#8c9196" }}>+</span>
          </div>
        ))}
      </div>
    ),
    "08": ( // Image + FAQ
      <div style={{ width: "100%", display: "flex", gap: "10px" }}>
        <div style={{ width: "40%", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "8px", minHeight: "100px" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ borderBottom: "1px solid #e1e3e5", paddingBottom: "6px", display: "flex", justifyContent: "space-between" }}>
              <div style={lineStyle(i === 2 ? "70%" : "55%", true)} />
              <span style={{ fontSize: "12px", color: "#8c9196" }}>+</span>
            </div>
          ))}
        </div>
      </div>
    ),
    "09": ( // Centered Premium
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div style={{ ...lineStyle("50%", true), height: "10px", borderRadius: "6px" }} />
        <div style={{ ...lineStyle("70%"), height: "6px" }} />
        {[1, 2].map((i) => (
          <div key={i} style={{ width: "100%", border: "1px solid #e1e3e5", borderRadius: "10px", padding: "10px", display: "flex", justifyContent: "space-between" }}>
            <div style={lineStyle(i === 1 ? "60%" : "75%", true)} />
            <span style={{ fontSize: "14px", color: "#5c6ac4" }}>{i === 1 ? "−" : "+"}</span>
          </div>
        ))}
      </div>
    ),
    "10": ( // Dark FAQ
      <div style={{ width: "100%", height: "120px", background: "#1a1a2e", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ ...lineStyle(i === 1 ? "60%" : "75%"), background: "rgba(255,255,255,0.3)" }} />
            <span style={{ fontSize: "14px", color: "#00d4ff" }}>{i === 1 ? "−" : "+"}</span>
          </div>
        ))}
      </div>
    ),
    "11": ( // Highlighted Question
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: i === 1 ? "linear-gradient(to right, #e8f0ff, transparent)" : "transparent", padding: "8px", borderRadius: "6px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: i === 1 ? "#5c6ac4" : "#e1e3e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "10px", color: i === 1 ? "white" : "#637381", fontWeight: "bold" }}>Q</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={lineStyle("75%", true)} />
              {i === 1 && <div style={lineStyle("90%")} />}
            </div>
          </div>
        ))}
      </div>
    ),
    "12": ( // Borderless FAQ
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              <div style={lineStyle(i === 2 ? "80%" : "60%", true)} />
              {i === 1 && <div style={lineStyle("100%")} />}
            </div>
            <span style={{ fontSize: "16px", color: "#8c9196", marginLeft: "8px" }}>{i === 1 ? "↑" : "↓"}</span>
          </div>
        ))}
      </div>
    ),
    "13": ( // Split FAQ
      <div style={{ width: "100%", display: "flex", gap: "10px", height: "120px" }}>
        <div style={{ width: "45%", display: "flex", flexDirection: "column", gap: "6px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ padding: "6px 8px", borderRadius: "6px", background: i === 1 ? "#5c6ac4" : "#f4f6f8", cursor: "pointer" }}>
              <div style={{ ...lineStyle("80%"), background: i === 1 ? "rgba(255,255,255,0.5)" : "#e1e3e5" }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: "#f9fafb", borderRadius: "8px", padding: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={lineStyle("90%", true)} />
          <div style={lineStyle("100%")} />
          <div style={lineStyle("80%")} />
        </div>
      </div>
    ),
    "14": ( // Timeline FAQ
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "4px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: i === 1 ? "#008060" : "#e1e3e5", border: "2px solid white", boxShadow: "0 0 0 2px " + (i === 1 ? "#008060" : "#e1e3e5") }} />
              {i < 3 && <div style={{ width: "2px", height: "20px", background: "#e1e3e5" }} />}
            </div>
            <div style={lineStyle(i === 2 ? "70%" : "55%", i <= 1)} />
          </div>
        ))}
      </div>
    ),
    "15": ( // Compact FAQ
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f2f3", paddingBottom: "5px" }}>
            <div style={lineStyle(["55%", "70%", "60%", "65%"][i - 1], true)} />
            <span style={{ fontSize: "12px", color: "#8c9196" }}>+</span>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div style={styles}>
      {previewMap[designId] || (
        <div style={{ color: "#8c9196" }}>Preview</div>
      )}
    </div>
  );
}

const planBadgeColor: Record<string, "success" | "info" | "warning" | "critical"> = {
  Free: "success",
  Simple: "info",
  Pro: "warning",
  Ultimate: "critical",
};

const categoryEmoji: Record<string, string> = {
  Minimal: "✦",
  Modern: "◈",
  Creative: "◉",
  Premium: "★",
};

export default function Designs() {
  const { plan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const planLevels: Record<string, number> = {
    Free: 1,
    Simple: 2,
    Pro: 3,
    Ultimate: 4,
  };

  return (
    <Page
      title="Design Library"
      subtitle={`${DESIGN_REGISTRY.filter((d) => (planLevels[d.planRequired] || 1) <= (planLevels[plan] || 1)).length} of ${DESIGN_REGISTRY.length} designs unlocked · ${plan} plan`}
      primaryAction={{
        content: "Upgrade Plan",
        onAction: () => navigate("/app/billing"),
      }}
    >
      <BlockStack gap="500">
        <Grid>
          {DESIGN_REGISTRY.map((design) => {
            const hasAccess = canAccessDesign(plan, design.id);
            return (
              <Grid.Cell
                key={design.id}
                columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}
              >
                <div
                  style={{
                    border: "1px solid #e1e3e5",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "white",
                    opacity: hasAccess ? 1 : 0.75,
                    transition: "box-shadow 0.2s, transform 0.15s",
                    cursor: hasAccess ? "pointer" : "default",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (hasAccess) {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 4px 20px rgba(0,0,0,0.12)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.transform = "none";
                  }}
                >
                  {/* Lock overlay */}
                  {!hasAccess && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(0,0,0,0.6)",
                        borderRadius: "20px",
                        padding: "4px 10px",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: "bold",
                        zIndex: 1,
                      }}
                    >
                      🔒 {design.planRequired}+
                    </div>
                  )}

                  {/* Preview area */}
                  <DesignPreview designId={design.id} />

                  {/* Card info */}
                  <div style={{ padding: "16px" }}>
                    <BlockStack gap="200">
                      <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="100" blockAlign="center">
                          <span style={{ fontSize: "14px" }}>
                            {categoryEmoji[design.category]}
                          </span>
                          <Text as="h3" variant="headingSm">
                            {design.name}
                          </Text>
                        </InlineStack>
                        <Badge
                          tone={hasAccess ? "success" : planBadgeColor[design.planRequired]}
                        >
                          {hasAccess ? "Unlocked" : design.planRequired}
                        </Badge>
                      </InlineStack>

                      <Text as="p" variant="bodySm" tone="subdued">
                        {design.description}
                      </Text>

                      <div style={{ marginTop: "6px" }}>
                        {hasAccess ? (
                          <Button
                            fullWidth
                            size="slim"
                            onClick={() => navigate("/app/faqs")}
                          >
                            Use this design
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            size="slim"
                            variant="primary"
                            onClick={() => navigate("/app/billing")}
                          >
                            Upgrade to unlock →
                          </Button>
                        )}
                      </div>
                    </BlockStack>
                  </div>
                </div>
              </Grid.Cell>
            );
          })}
        </Grid>
      </BlockStack>
    </Page>
  );
}
