import { useEffect, useMemo, useState } from "react";
import { extractLiferayImageUris, resolveLiferayUris } from "../plugins/liferayUriResolver";

export function useLiferayUriMap(markdown, ctx) {
  const uris = useMemo(() => extractLiferayImageUris(markdown), [markdown]);
  const [uriMap, setUriMap] = useState({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const map = await resolveLiferayUris({ uris, ctx });
      if (!cancelled) setUriMap(map);
    })();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(uris), ctx]);

  return uriMap;
}