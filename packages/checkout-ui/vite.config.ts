import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import dts from "vite-plugin-dts";
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default', // 确保默认导出为组件
        icon: true, // 允许修改 SVG 的 viewBox 等属性
        typescript: false,
      },
      include: '**/*.svg',
    }),
    dts({
      include: ["src"],
      exclude: ["src/**/*.test.tsx", "src/**/*.stories.tsx", "src/main.tsx"],
    }),
  ],

  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },

    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "sonner"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        banner: '"use client";', // 在输出文件顶部添加 "use client"
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
