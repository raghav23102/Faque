import { PrismaClient } from "@prisma/client";

function buildDatabaseUrl() {
  let url = process.env.DATABASE_URL || process.env.MONGODB_URI || "";

  if (!url) return url;

  // Inject database name "faque" if missing from MongoDB URI
  // e.g. mongodb+srv://user:pass@host.mongodb.net/?... -> mongodb+srv://user:pass@host.mongodb.net/faque?...
  if (url.startsWith("mongodb") && !url.match(/\.mongodb\.net\/[^?]+/)) {
    url = url.replace(
      /\.mongodb\.net\//,
      ".mongodb.net/faque"
    );
  }

  return url;
}

const dbUrl = buildDatabaseUrl();
if (dbUrl) {
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
