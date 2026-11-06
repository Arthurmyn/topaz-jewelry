import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  { ignores: [".next/**", "src/lib/api/schema.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
