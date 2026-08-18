import { setDefaultResultOrder } from "node:dns";
import { statSync } from "node:fs";
import path from "node:path";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "@/generated/prisma/client";

try {
  setDefaultResultOrder("ipv4first");
} catch {
  // Edge-like runtimes may forbid this; Node server components are fine.
}

neonConfig.webSocketConstructor =
  typeof WebSocket === "function" ? WebSocket : (ws as unknown as typeof WebSocket);
// Pool.query over HTTP avoids the Neon WS handshake that Next serializes as `{clientVersion:"7.9.1"}`.
neonConfig.poolQueryViaFetch = true;

const generatedClientPath = path.join(process.cwd(), "generated/prisma/client.ts");
const PRISMA_CLIENT_ID = "neon-adapter-http-pool-v1";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientMtimeMs?: number;
  prismaClientId?: string;
};

function generatedClientMtimeMs() {
  try {
    return statSync(generatedClientPath).mtimeMs;
  } catch {
    return 0;
  }
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaNeon({
    connectionString,
    connectionTimeoutMillis: 20_000,
  });

  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  const clientMtimeMs = generatedClientMtimeMs();
  const cached = globalForPrisma.prisma;

  if (
    cached &&
    globalForPrisma.prismaClientId === PRISMA_CLIENT_ID &&
    (process.env.NODE_ENV === "production" ||
      globalForPrisma.prismaClientMtimeMs === clientMtimeMs)
  ) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect();
  }

  const prisma = createPrismaClient();
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaClientMtimeMs = clientMtimeMs;
  globalForPrisma.prismaClientId = PRISMA_CLIENT_ID;
  return prisma;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/** Next.js overlays Prisma/Neon Event objects as `{clientVersion:"7.9.1"}` — unwrap a real message. */
export function asDbError(error: unknown): Error {
  if (error instanceof Error && error.message && error.message !== "[object Object]") {
    return error;
  }

  const record = error as {
    message?: string;
    code?: string;
    constructor?: { name?: string };
  };
  const name = record?.constructor?.name;
  const message =
    record?.message ||
    (name === "ErrorEvent" || name === "Event"
      ? "Database connection timed out reaching Neon. Retry in a few seconds."
      : "Database request failed");
  const wrapped = new Error(message);
  wrapped.cause = error;
  return wrapped;
}
