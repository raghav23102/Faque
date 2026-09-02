import { PrismaClient } from "@prisma/client";

let dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI || "";

if (dbUrl && dbUrl.startsWith("mongodb")) {
  if (!dbUrl.includes("connectTimeoutMS")) {
    const separator = dbUrl.includes("?") ? "&" : "?";
    dbUrl += `${separator}connectTimeoutMS=5000&serverSelectionTimeoutMS=5000`;
  }
  process.env.DATABASE_URL = dbUrl;
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient;
}

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}

const prisma = global.prismaGlobal ?? new PrismaClient();

export default prisma;
