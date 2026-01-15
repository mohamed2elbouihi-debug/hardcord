import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: true
  }
});
