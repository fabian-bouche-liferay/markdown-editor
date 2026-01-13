import { visit } from "unist-util-visit";

export function rehypeResolveLiferayUris({ uriMap }) {
  return () => (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;

      const src = node.properties?.src;
      if (typeof src !== "string") return;
      if (!src.startsWith("liferay://")) return;

      node.properties["data-liferay-src"] = src;

      const resolved = uriMap?.[src];
      if (typeof resolved === "string" && resolved) {
        node.properties.src = resolved;
      } else {
        node.properties.src = "";
      }
    });
  };
}