import { config } from "dotenv";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../generated/prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

function dump(error: unknown) {
  const e = error as Record<string, unknown> & Error;
  console.log("--- Prisma error dump ---");
  console.log("typeof:", typeof error);
  console.log("name:", e?.name);
  console.log("message:", e?.message);
  console.log("code:", e?.code);
  console.log("errorCode:", e?.errorCode);
  console.log("clientVersion:", e?.clientVersion);
  console.log("keys:", Object.keys(e ?? {}));
  console.log("string:", String(error));
  try {
    console.log("json:", JSON.stringify(error));
  } catch {
    console.log("json: <unserializable>");
  }
  console.log("stack:", e?.stack);
}

const connectionString = process.env.DATABASE_URL;
console.log("DATABASE_URL set:", Boolean(connectionString));
console.log("host:", connectionString?.split("@")[1]?.split("/")[0]);

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

neonConfig.webSocketConstructor =
  typeof WebSocket === "function" ? WebSocket : (ws as unknown as typeof WebSocket);
neonConfig.poolQueryViaFetch = true;

const adapter = new PrismaNeon({
  connectionString,
  connectionTimeoutMillis: 20_000,
});
const db = new PrismaClient({ adapter, errorFormat: "pretty" });

try {
  const settings = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  const featured = await db.collection.count({
    where: { published: true, featured: true },
  });
  console.log("OK settings:", settings?.id ?? null);
  console.log("OK featured count:", featured);
} catch (error) {
  dump(error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
