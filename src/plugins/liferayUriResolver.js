const OBJ_PREFIX = "liferay://object-field/";
const DL_PREFIX = "liferay://document-library/";

export function extractLiferayImageUris(markdown) {
  const md = markdown ?? "";
  const uris = new Set();

  const re = /!\[[^\]]*]\((liferay:\/\/[^)\s]+)(?:\s+"[^"]*")?\)/g;

  let m;
  while ((m = re.exec(md)) !== null) {
    uris.add(m[1]);
  }

  return [...uris];
}

export async function resolveOneLiferayUri(uri, ctx) {
  if (typeof uri !== "string" || !uri.startsWith("liferay://")) return null;

    if (uri.startsWith(OBJ_PREFIX)) {
        const fieldName = uri.slice(OBJ_PREFIX.length);
        return ctx?.objectEntry?.[fieldName]?.link?.href ?? null;
    }

    if (uri.startsWith(DL_PREFIX)) {
        const externalReferenceCode = uri.slice(DL_PREFIX.length);
        if (!externalReferenceCode) return null;

        if (typeof ctx?.resolveDLByERC === "function") {
            const url = await ctx.resolveDLByERC(window.Liferay.ThemeDisplay.getSiteGroupId(), externalReferenceCode);
            return typeof url === "string" && url ? url : null;
        }

        return null;
    }

  return null;
}

export async function resolveLiferayUris({ uris, ctx }) {
  const unique = [...new Set(uris || [])];
  if (!unique.length) return {};

  const entries = await Promise.all(
    unique.map(async (uri) => {
      const resolved = await resolveOneLiferayUri(uri, ctx);
      return [uri, resolved];
    })
  );

  const map = {};
  for (const [uri, resolved] of entries) {
    if (typeof resolved === "string" && resolved) map[uri] = resolved;
  }
  return map;
}
