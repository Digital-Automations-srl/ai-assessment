import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "docs/**",
    // Worktree isolate dei chip operativi: contengono copie del repo + .next
    // generato → non vanno mai linttate dal root (falsi positivi a migliaia).
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
