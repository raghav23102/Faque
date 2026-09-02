import prisma from "../db.server";

export const PLAN_FREE = "Free";
export const PLAN_SIMPLE = "Simple";
export const PLAN_PRO = "Pro";
export const PLAN_ULTIMATE = "Ultimate";

export const PLAN_LIMITS = {
  [PLAN_FREE]: { designLimit: 1, questionLimit: 5 },
  [PLAN_SIMPLE]: { designLimit: 5, questionLimit: 999999 },
  [PLAN_PRO]: { designLimit: 8, questionLimit: 999999 },
  [PLAN_ULTIMATE]: { designLimit: 999999, questionLimit: 999999 },
};

export async function getSubscription(shop: string) {
  const sub = await prisma.subscription.findUnique({
    where: { shop },
  });

  if (!sub) {
    // Default to Free plan if none exists
    return { plan: PLAN_FREE };
  }

  return sub;
}

export async function updateSubscription(shop: string, plan: string) {
  return prisma.subscription.upsert({
    where: { shop },
    update: { plan },
    create: { shop, plan },
  });
}
