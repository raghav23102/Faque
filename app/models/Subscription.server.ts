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
  try {
    const sub = await prisma.subscription.findFirst({
      where: { shop },
    });

    if (!sub) {
      return { plan: PLAN_FREE };
    }

    return sub;
  } catch (err) {
    console.error("getSubscription error:", err);
    return { plan: PLAN_FREE };
  }
}

export async function updateSubscription(shop: string, plan: string) {
  try {
    const existing = await prisma.subscription.findFirst({ where: { shop } });
    if (existing) {
      return await prisma.subscription.update({
        where: { id: existing.id },
        data: { plan },
      });
    }
    return await prisma.subscription.create({
      data: { shop, plan },
    });
  } catch (err) {
    console.error("updateSubscription error:", err);
    throw err;
  }
}
