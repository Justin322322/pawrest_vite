import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./mysql-migrations",
  schema: "./shared/mysql-schema.ts",
  dialect: "mysql2",
  dbCredentials: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'modern_pet_memorial',
  },
});
