import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const raiz = fileURLToPath(new URL(".", import.meta.url));

function entradas(dir, lista = []) {
  for (const nome of readdirSync(dir)) {
    if (nome === "node_modules" || nome === "src") continue;
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) entradas(p, lista);
    else if (nome === "index.html") lista.push(p);
  }
  return lista;
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: { outDir: "..", emptyOutDir: false, assetsDir: "app", rollupOptions: { input: entradas(raiz) } },
});
