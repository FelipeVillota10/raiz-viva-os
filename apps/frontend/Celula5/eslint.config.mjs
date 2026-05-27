import { defineConfig } from "eslint/config";

export default defineConfig({
  root: true,
  ignorePatterns: [".next/**", "out/**", "build/**", "next-env.d.ts"],
});
