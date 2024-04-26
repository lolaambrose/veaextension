import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "build",
    rollupOptions: {
      output: {
        chunkFileNames: "assets/chunk-[hash].js",
      },
    },
  },

  plugins: [crx({ manifest })],
});
