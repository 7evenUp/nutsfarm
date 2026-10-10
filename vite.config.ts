import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import svgr from "vite-plugin-svgr"
import path from "path"

export default defineConfig(({ command }) => {
  if (command === "serve") {
    return {
      plugins: [react(), svgr()],
      define: { "import.meta.env.VITE_IS_DEV_LOCAL": JSON.stringify("demo") },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
    }
  } else {
    // command === "build"
    return {
      // build: {
      //   rollupOptions: {
      //     output: {
      //       manualChunks(id) {
      //         if (id.includes("node_modules")) {
      //           const modulePath = id.split("node_modules/")[1]
      //           const topLevelFolder = modulePath.split("/")[0]
      //           if (topLevelFolder !== ".pnpm") {
      //             return topLevelFolder
      //           }
      //           const scopedPackageName = modulePath.split("/")[1]
      //           const chunkName =
      //             scopedPackageName.split("@")[
      //               scopedPackageName.startsWith("@") ? 1 : 0
      //             ]
      //           return chunkName
      //         }
      //       },
      //     },
      //   },
      // },
      plugins: [react(), svgr()],
      define: { "import.meta.env.VITE_IS_DEV_LOCAL": JSON.stringify("demo") },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
    }
  }
})
