// Prisma 7 CLI config. The datasource URL lives here (not in schema.prisma) so
// the CLI and the runtime driver adapter both read the same env var.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
