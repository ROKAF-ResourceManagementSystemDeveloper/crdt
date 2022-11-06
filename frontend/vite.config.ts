import { defineConfig } from "vite";
import Unocss from "unocss/vite";
import unocss from "./uno.config";
import { extractorSvelte } from "@unocss/core";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [Unocss(unocss), svelte()],
  server: {
    host: "0.0.0.0",
    port: 5053,
  },
});
