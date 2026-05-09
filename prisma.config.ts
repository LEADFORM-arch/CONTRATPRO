// @ts-nocheck
import { defineConfig } from "prisma/config";

const fallbackUrl = "postgresql://contratpro:contratpro@localhost:5432/contratpro";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? fallbackUrl,
    directUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? fallbackUrl,
  },
});
