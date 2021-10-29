import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [
    vue({
      script: {
        refSugar: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3002,
    proxy: {
      "/api": {
        target: "http://localhost:8888/",
      },
      "/accounts": {
        target: "http://localhost:8888/",
      },
    },
  },
});
