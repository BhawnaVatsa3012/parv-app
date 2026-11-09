import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests run in plain Node: no network, no real keys. Supabase and
// Razorpay SDK calls are mocked inside each test file.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
  test: { environment: "node", include: ["tests/**/*.test.js"], restoreMocks: true },
});
