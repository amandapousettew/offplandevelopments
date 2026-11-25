import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {fileURLToPath} from "node:url";

export default defineConfig({
  root: "pages",
  base: "./",
  publicDir: "../public",
  plugins: [react()],
  build: {
    outDir: "../docs", emptyOutDir: true,
    rollupOptions: {input: ["./index.html","./sv/index.html"].map(path=>fileURLToPath(new URL(path,import.meta.url)))},
  },
});
