import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple instances of Prisma Client in development HMR
  var __jetkurPrismaClient: PrismaClient | undefined;
}

export const prisma =
  global.__jetkurPrismaClient ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__jetkurPrismaClient = prisma;
}

export default prisma;
