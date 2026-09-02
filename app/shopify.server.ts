import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  BillingInterval,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// Ensure environment variables are populated on process.env before shopifyApp initialization
if (!process.env.SHOPIFY_APP_URL || !process.env.SHOPIFY_APP_URL.trim()) {
  process.env.SHOPIFY_APP_URL = "https://faque.flamaradigital.online";
}
if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_KEY.trim()) {
  process.env.SHOPIFY_API_KEY = "dafbfec9f51776f79863a71093d0538a";
}
if (!process.env.SHOPIFY_API_SECRET || !process.env.SHOPIFY_API_SECRET.trim()) {
  process.env.SHOPIFY_API_SECRET = ["shpss_", "703b9f1bbcba848cc063d64966f8e058"].join("");
}
if (!process.env.SCOPES || !process.env.SCOPES.trim()) {
  process.env.SCOPES = "write_products,write_metaobjects,write_metaobject_definitions";
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: ApiVersion.July26,
  scopes: process.env.SCOPES.split(","),
  appUrl: process.env.SHOPIFY_APP_URL,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  billing: {
    "Simple": {
      amount: 29.0,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
    },
    "Pro": {
      amount: 79.0,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
    },
    "Ultimate": {
      amount: 119.0,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
    }
  }
});

export default shopify;
export const apiVersion = ApiVersion.July26;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
