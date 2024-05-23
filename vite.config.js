import { crx } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";
import manifest from "./manifest.json";

export default defineConfig({
   build: {
      emptyOutDir: true,
      outDir: "build",
      rollupOptions: {
         output: {
            chunkFileNames: "assets/chunk-[hash].js",
         },
         input: {
            popup: "src/pages/popup.html",
         },
      },
   },

   plugins: [crx({ manifest })],
});
