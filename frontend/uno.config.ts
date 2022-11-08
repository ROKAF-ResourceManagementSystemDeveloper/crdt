import { defineConfig } from "unocss";
import { extractorSvelte } from "@unocss/core";

export default defineConfig({
  extractors: [extractorSvelte],
  shortcuts: [{}],
});
