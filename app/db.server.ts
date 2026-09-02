import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient;
}

// On Vercel serverless functions, the root directory is read-only.
// If using SQLite, copy dev.sqlite to writable /tmp directory if not present.
if (process.env.VERCEL) {
  try {
    const tmpDbPath = "/tmp/dev.sqlite";
    if (!fs.existsSync(tmpDbPath)) {
      const srcDbPath = path.join(process.cwd(), "prisma", "dev.sqlite");
      if (fs.existsSync(srcDbPath)) {
        fs.copyFileSync(srcDbPath, tmpDbPath);
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  } catch (e) {
    console.error("Vercel DB setup notice:", e);
  }
}

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}

const prisma = global.prismaGlobal ?? new PrismaClient();

export default prisma;
