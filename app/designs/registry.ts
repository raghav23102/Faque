export interface FAQDesign {
  id: string;
  name: string;
  description: string;
  category: "Minimal" | "Modern" | "Creative" | "Premium";
  planRequired: "Free" | "Simple" | "Pro" | "Ultimate";
}

export const DESIGN_REGISTRY: FAQDesign[] = [
  { id: "01", name: "Minimal Accordion", description: "Thin separators, plus/minus icon, minimal spacing.", category: "Minimal", planRequired: "Free" },
  { id: "02", name: "Modern Cards", description: "Rounded FAQ cards with border and subtle hover shadow.", category: "Modern", planRequired: "Simple" },
  { id: "03", name: "Two Column", description: "Two columns on desktop, one column on mobile.", category: "Modern", planRequired: "Simple" },
  { id: "04", name: "Editorial", description: "Premium typography with generous spacing and numbered questions.", category: "Premium", planRequired: "Simple" },
  { id: "05", name: "Category Tabs", description: "Simple tab navigation for categorized questions.", category: "Modern", planRequired: "Simple" },
  { id: "06", name: "Sidebar FAQ", description: "Categories on left, content on right. Dropdown on mobile.", category: "Creative", planRequired: "Pro" },
  { id: "07", name: "Search FAQ", description: "Simple search field that filters questions instantly.", category: "Creative", planRequired: "Pro" },
  { id: "08", name: "Image + FAQ", description: "Image alongside FAQ content, responsive layout.", category: "Creative", planRequired: "Pro" },
  { id: "09", name: "Centered Premium", description: "Centered heading, rounded accordion, spacious layout.", category: "Premium", planRequired: "Pro" },
  { id: "10", name: "Dark FAQ", description: "Dark background with high contrast accent colors.", category: "Minimal", planRequired: "Ultimate" },
  { id: "11", name: "Highlighted Question", description: "Numbered/icon question layout with strong emphasis.", category: "Modern", planRequired: "Ultimate" },
  { id: "12", name: "Borderless FAQ", description: "Ultra-minimal, no cards or heavy borders.", category: "Minimal", planRequired: "Ultimate" },
  { id: "13", name: "Split FAQ", description: "Questions on left, selected answer on right.", category: "Creative", planRequired: "Ultimate" },
  { id: "14", name: "Timeline FAQ", description: "Vertical timeline with numbered FAQ items.", category: "Creative", planRequired: "Ultimate" },
  { id: "15", name: "Compact FAQ", description: "Compact typography and spacing for many questions.", category: "Minimal", planRequired: "Ultimate" },
];

// Helper to check if a shop's plan allows a design
export function canAccessDesign(plan: string, designId: string): boolean {
  const design = DESIGN_REGISTRY.find(d => d.id === designId);
  if (!design) return false;

  const planLevels = {
    "Free": 1,
    "Simple": 2,
    "Pro": 3,
    "Ultimate": 4
  };

  const shopLevel = planLevels[plan as keyof typeof planLevels] || 1;
  const requiredLevel = planLevels[design.planRequired as keyof typeof planLevels] || 1;

  return shopLevel >= requiredLevel;
}
