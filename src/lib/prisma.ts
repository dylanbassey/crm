import { PrismaClient } from "@/generated/prisma/client";

const GlobalForPrimsa = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  GlobalForPrimsa.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV === "development") {
  GlobalForPrimsa.prisma = prisma;
}
