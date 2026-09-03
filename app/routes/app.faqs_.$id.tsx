import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  ResourceList,
  ResourceItem,
  FormLayout,
  TextField,
  Banner,
  Badge,
  InlineStack,
  Divider,
  Modal,
  Grid,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, useRevalidator } from "react-router";
import prisma from "../db.server";
import { LoaderFunctionArgs } from "react-router";
import { useState, useCallback } from "react";
import { DESIGN_REGISTRY, canAccessDesign } from "../designs/registry";
import { getSubscription } from "../models/Subscription.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [faq, subscription] = await Promise.all([
    prisma.fAQ.findUnique({
      where: { id: params.id, shop: session.shop },
      include: { questions: { orderBy: { position: "asc" } } },
    }),
    getSubscription(session.shop),
  ]);

  if (!faq) throw new Response("FAQ not found", { status: 404 });
  return { faq, plan: subscription.plan };
};

// Mini inline design preview (same as Designs page but smaller)
function MiniPreview({ designId }: { designId: string }) {
  const line = (w: string, dark = false): React.CSSProperties => ({
    height: "6px", width: w, borderRadius: "3px",
    background: dark ? "#c1c5ca" : "#e1e3e5", flexShrink: 0,
  });

  const wrap: React.CSSProperties = {
    width: "100%", height: "100px", background: "#f9fafb",
    borderRadius: "6px", display: "flex", flexDirection: "column",
    justifyContent: "center", alignItems: "center",
    padding: "10px", gap: "6px", overflow: "hidden",
  };

  const previews: Record<string, React.ReactNode> = {
    "01": (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e1e3e5", paddingBottom: "5px" }}>
            <div style={line(i === 2 ? "70%" : "55%", true)} />
            <span style={{ fontSize: "12px", color: "#8c9196" }}>{i === 1 ? "−" : "+"}</span>
          </div>
        ))}
      </div>
    ),
    "02": (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "5px" }}>
        {[1, 2].map(i => (
          <div key={i} style={{ background: "white", border: "1px solid #e1e3e5", borderRadius: "6px", padding: "7px", boxShadow: i === 1 ? "0 2px 6px rgba(0,0,0,0.08)" : "none" }}>
            <div style={line("65%", true)} />
          </div>
        ))}
      </div>
    ),
    "03": (
      <div style={{ width: "100%", display: "flex", gap: "6px" }}>
        {[1, 2].map(col => (
          <div key={col} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            {[1, 2].map(i => <div key={i} style={{ borderLeft: "2px solid #5c6ac4", paddingLeft: "6px" }}><div style={line("80%", true)} /></div>)}
          </div>
        ))}
      </div>
    ),
    "04": (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "9px", fontWeight: "bold", color: "#5c6ac4" }}>0{i}</span>
            <div style={line(i === 2 ? "75%" : "55%", true)} />
          </div>
        ))}
      </div>
    ),
    "05": (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {["All", "Ship", "Return"].map((t, i) => (
            <div key={t} style={{ padding: "2px 7px", borderRadius: "10px", background: i === 0 ? "#5c6ac4" : "#e1e3e5", fontSize: "8px", color: i === 0 ? "white" : "#637381" }}>{t}</div>
          ))}
        </div>
        {[1, 2].map(i => <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e1e3e5", paddingBottom: "5px" }}><div style={line("60%", true)} /><span style={{ fontSize: "12px", color: "#8c9196" }}>+</span></div>)}
      </div>
    ),
    "06": (
      <div style={{ width: "100%", display: "flex", gap: "7px", height: "80px" }}>
        <div style={{ width: "35%", background: "#f4f6f8", borderRadius: "4px", padding: "5px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {["Gen", "Ship", "Ret"].map((t, i) => <div key={t} style={{ padding: "3px 5px", borderRadius: "3px", background: i === 0 ? "#5c6ac4" : "transparent", fontSize: "8px", color: i === 0 ? "white" : "#637381" }}>{t}</div>)}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          {[1, 2].map(i => <div key={i} style={{ borderBottom: "1px solid #e1e3e5", paddingBottom: "5px" }}><div style={line("80%", true)} /></div>)}
        </div>
      </div>
    ),
    "07": (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ border: "2px solid #5c6ac4", borderRadius: "6px", padding: "5px 8px", display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "10px" }}>🔍</span>
          <div style={line("50%")} />
        </div>
        {[1, 2].map(i => <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e1e3e5", paddingBottom: "5px" }}><div style={line("65%", true)} /><span style={{ fontSize: "12px", color: "#8c9196" }}>+</span></div>)}
      </div>
    ),
    "08": (
      <div style={{ width: "100%", display: "flex", gap: "7px" }}>
        <div style={{ width: "38%", background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "6px", minHeight: "75px" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          {[1, 2, 3].map(i => <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e1e3e5", paddingBottom: "4px" }}><div style={line("70%", true)} /><span style={{ fontSize: "10px", color: "#8c9196" }}>+</span></div>)}
        </div>
      </div>
    ),
    "09": (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "7px" }}>
        <div style={{ ...line("45%", true), height: "8px" }} />
        {[1, 2].map(i => <div key={i} style={{ width: "100%", border: "1px solid #e1e3e5", borderRadius: "8px", padding: "7px", display: "flex", justifyContent: "space-between" }}><div style={line("60%", true)} /><span style={{ fontSize: "12px", color: "#5c6ac4" }}>{i === 1 ? "−" : "+"}</span></div>)}
      </div>
    ),
    "10": (
      <div style={{ width: "100%", height: "80px", background: "#1a1a2e", borderRadius: "6px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {[1, 2, 3].map(i => <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "5px" }}><div style={{ ...line("65%"), background: "rgba(255,255,255,0.3)" }} /><span style={{ fontSize: "10px", color: "#00d4ff" }}>{i === 1 ? "−" : "+"}</span></div>)}
      </div>
    ),
    "11": (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
        {[1, 2].map(i => (
          <div key={i} style={{ display: "flex", gap: "7px", alignItems: "center", background: i === 1 ? "linear-gradient(to right, #e8f0ff, transparent)" : "transparent", padding: "5px", borderRadius: "4px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: i === 1 ? "#5c6ac4" : "#e1e3e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "8px", color: i === 1 ? "white" : "#637381", fontWeight: "bold" }}>Q</span>
            </div>
            <div style={line("70%", true)} />
          </div>
        ))}
      </div>
    ),
    "12": (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        {[1, 2, 3].map(i => <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px" }}><div style={line(["50%", "70%", "60%"][i - 1], true)} /><span style={{ fontSize: "12px", color: "#8c9196" }}>{i === 1 ? "↑" : "↓"}</span></div>)}
      </div>
    ),
    "13": (
      <div style={{ width: "100%", display: "flex", gap: "7px", height: "80px" }}>
        <div style={{ width: "42%", display: "flex", flexDirection: "column", gap: "4px" }}>
          {[1, 2, 3].map(i => <div key={i} style={{ padding: "4px 6px", borderRadius: "4px", background: i === 1 ? "#5c6ac4" : "#f4f6f8" }}><div style={{ ...line("80%"), background: i === 1 ? "rgba(255,255,255,0.5)" : "#e1e3e5" }} /></div>)}
        </div>
        <div style={{ flex: 1, background: "#f9fafb", borderRadius: "6px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={line("90%", true)} />
          <div style={line("100%")} />
        </div>
      </div>
    ),
    "14": (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "3px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: i === 1 ? "#008060" : "#e1e3e5" }} />
              {i < 3 && <div style={{ width: "2px", height: "15px", background: "#e1e3e5" }} />}
            </div>
            <div style={line(i === 2 ? "70%" : "50%", i <= 1)} />
          </div>
        ))}
      </div>
    ),
    "15": (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "5px" }}>
        {[1, 2, 3, 4].map(i => <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f2f3", paddingBottom: "4px" }}><div style={line(["55%", "70%", "60%", "65%"][i - 1], true)} /><span style={{ fontSize: "10px", color: "#8c9196" }}>+</span></div>)}
      </div>
    ),
  };

  return (
    <div style={wrap}>
      {previews[designId] || <div style={{ color: "#8c9196", fontSize: "12px" }}>Preview</div>}
    </div>
  );
}

export default function EditFAQ() {
  const { faq, plan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingDesign, setIsChangingDesign] = useState(false);
  const [error, setError] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const currentDesign = DESIGN_REGISTRY.find(d => d.id === faq.designId);

  const handleAddQuestion = useCallback(async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setError("Both question and answer are required.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const token = await shopify.idToken();
      const body = new FormData();
      body.append("faqId", faq.id);
      body.append("question", newQuestion.trim());
      body.append("answer", newAnswer.trim());
      const response = await fetch("/api/questions/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Server error");
      shopify.toast.show("Question added!");
      setIsAdding(false);
      setNewQuestion("");
      setNewAnswer("");
      revalidator.revalidate();
    } catch (err: any) {
      setError(err.message || "Failed to add question.");
    } finally {
      setIsSaving(false);
    }
  }, [newQuestion, newAnswer, faq.id, revalidator]);

  const handleChangeDesign = useCallback(async (designId: string) => {
    setIsChangingDesign(true);
    try {
      const token = await shopify.idToken();
      const response = await fetch("/api/faqs/design", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ faqId: faq.id, designId }),
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Server error");
      shopify.toast.show("Design updated!");
      revalidator.revalidate();
    } catch (err: any) {
      shopify.toast.show(err.message || "Failed to update design.", { isError: true });
    } finally {
      setIsChangingDesign(false);
    }
  }, [faq.id, revalidator]);

  return (
    <Page
      backAction={{ content: "FAQs", url: "/app/faqs" }}
      title={faq.name}
      primaryAction={{ content: "Preview", onAction: () => navigate(`/app/preview?faqId=${faq.id}`) }}
      secondaryActions={[{ content: "Add Question", onAction: () => { setIsAdding(true); setError(""); } }]}
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner tone="critical" onDismiss={() => setError("")}><p>{error}</p></Banner>
          </Layout.Section>
        )}

        {/* Add Question form */}
        {isAdding && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">New Question</Text>
                <FormLayout>
                  <TextField label="Question" value={newQuestion} onChange={setNewQuestion} autoComplete="off" placeholder="e.g. What is your return policy?" />
                  <TextField label="Answer" value={newAnswer} onChange={setNewAnswer} autoComplete="off" multiline={4} placeholder="Write a clear, helpful answer..." />
                  <InlineStack gap="200">
                    <Button variant="primary" loading={isSaving} onClick={handleAddQuestion}>Save Question</Button>
                    <Button onClick={() => { setIsAdding(false); setError(""); setNewQuestion(""); setNewAnswer(""); }}>Cancel</Button>
                  </InlineStack>
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Questions list */}
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">Questions</Text>
                <Badge>{`${faq.questions.length} total`}</Badge>
              </InlineStack>
              {faq.questions.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <Text as="p" tone="subdued">No questions yet. Click "Add Question" to start.</Text>
                </div>
              ) : (
                <ResourceList
                  resourceName={{ singular: "Question", plural: "Questions" }}
                  items={faq.questions}
                  renderItem={(item) => {
                    const { id, question, answer } = item;
                    return (
                      <ResourceItem id={id} onClick={() => {}}>
                        <Text variant="bodyMd" fontWeight="bold" as="h3">{question}</Text>
                        <Text variant="bodyMd" as="p" tone="subdued">{answer}</Text>
                      </ResourceItem>
                    );
                  }}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Sidebar — Settings + Design */}
        <Layout.Section variant="oneThird">
          {/* FAQ Info */}
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">FAQ Info</Text>
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">HEADING</Text>
                <Text as="p" fontWeight="semibold">{faq.heading}</Text>
              </BlockStack>
              {faq.description && (
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">DESCRIPTION</Text>
                  <Text as="p">{faq.description}</Text>
                </BlockStack>
              )}

              {faq.designId === "08" && (
                <>
                  <Divider />
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">Design Settings</Text>
                    <TextField 
                      label="Image URL" 
                      value={(() => {
                        try { return JSON.parse(faq.settings || "{}").imageUrl || ""; } 
                        catch { return ""; }
                      })()} 
                      onChange={async (val) => {
                        setIsChangingDesign(true);
                        try {
                          const token = await shopify.idToken();
                          const response = await fetch("/api/faqs/design", {
                            method: "POST",
                            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                            body: JSON.stringify({ faqId: faq.id, settings: { imageUrl: val } }),
                          });
                          if (!response.ok) throw new Error("Failed to save image");
                          revalidator.revalidate();
                        } catch(e) {
                          console.error(e);
                        } finally {
                          setIsChangingDesign(false);
                        }
                      }}
                      autoComplete="off" 
                      placeholder="https://your-store.com/image.jpg"
                      helpText="Provide a URL for the image to display next to your FAQ."
                    />
                  </BlockStack>
                </>
              )}
            </BlockStack>
          </Card>

          {/* Design Picker */}
          <div style={{ marginTop: "16px" }}>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Design</Text>
                  {isChangingDesign && <Badge tone="info">Saving…</Badge>}
                </InlineStack>

                {/* Current design preview */}
                <BlockStack gap="200">
                  <MiniPreview designId={faq.designId} />
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="0">
                      <Text as="p" fontWeight="semibold">{currentDesign?.name || faq.designId}</Text>
                      <Text as="p" variant="bodySm" tone="subdued">{currentDesign?.category}</Text>
                    </BlockStack>
                    <Badge tone="success">Active</Badge>
                  </InlineStack>
                </BlockStack>

                <Divider />

                <Text as="p" variant="bodySm" tone="subdued">Choose a different design:</Text>

                <BlockStack gap="200">
                  {DESIGN_REGISTRY.map((design) => {
                    const hasAccess = canAccessDesign(plan, design.id);
                    const isActive = design.id === faq.designId;
                    return (
                      <div
                        key={design.id}
                        style={{
                          border: isActive ? "2px solid #008060" : "1px solid #e1e3e5",
                          borderRadius: "8px",
                          overflow: "hidden",
                          opacity: hasAccess ? 1 : 0.6,
                        }}
                      >
                        <MiniPreview designId={design.id} />
                        <div style={{ padding: "8px 10px", background: "white" }}>
                          <InlineStack align="space-between" blockAlign="center">
                            <BlockStack gap="0">
                              <Text as="p" variant="bodySm" fontWeight="semibold">{design.name}</Text>
                              {!hasAccess && <Text as="p" variant="bodySm" tone="subdued">{design.planRequired}+ plan</Text>}
                            </BlockStack>
                            {isActive ? (
                              <Badge tone="success">Active</Badge>
                            ) : hasAccess ? (
                              <Button size="micro" loading={isChangingDesign} onClick={() => handleChangeDesign(design.id)}>Apply</Button>
                            ) : (
                              <Button size="micro" onClick={() => navigate("/app/billing")}>Upgrade</Button>
                            )}
                          </InlineStack>
                        </div>
                      </div>
                    );
                  })}
                </BlockStack>
              </BlockStack>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
