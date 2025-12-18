import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import { createRequire } from "module";

const local = process.env.LOCAL_DEV === "true";
const require = createRequire(import.meta.url);

function pickExisting(...candidates) {
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function uiwCssShadowFix() {
  const mdEditorPkgJson = require.resolve("@uiw/react-md-editor/package.json");
  const mdPreviewPkgJson = require.resolve("@uiw/react-markdown-preview/package.json");

  const mdEditorDir = path.dirname(mdEditorPkgJson);
  const mdPreviewDir = path.dirname(mdPreviewPkgJson);

  const mdeditorCssPath = pickExisting(
    path.join(mdEditorDir, "dist", "mdeditor.css"),
    path.join(mdEditorDir, "dist", "mdeditor.min.css")
  );

  const markdownCssPath = pickExisting(
    path.join(mdPreviewDir, "dist", "markdown.css"),
    path.join(mdPreviewDir, "dist", "markdown.min.css")
  );

  if (!mdeditorCssPath || !markdownCssPath) {
    throw new Error(
      `[uiw-css-shadow-fix] CSS introuvable. mdeditor=${mdeditorCssPath} markdown=${markdownCssPath}`
    );
  }

  return {
    name: "uiw-css-shadow-fix",
    enforce: "pre",
    resolveId(source) {
      if (source.startsWith("@uiw-mdeditor-css")) {
        return mdeditorCssPath + source.slice("@uiw-mdeditor-css".length);
      }
      if (source.startsWith("@uiw-markdown-css")) {
        return markdownCssPath + source.slice("@uiw-markdown-css".length);
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [uiwCssShadowFix()],

  build: {
    rollupOptions: {
      external: local ? [] : ["@clayui/*", "react", "react-dom"],
    },
    outDir: path.resolve(__dirname, "build/static"),
    emptyOutDir: true,
    assetsDir: "assets",
  },
});
