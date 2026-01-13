import React, { useEffect, useMemo, useState } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";
import { rehypeResolveLiferayUris } from "./plugins/rehypeResolveLiferayUris";

import { useLiferayUriMap } from "./hooks/useLiferayUriMap";

import resolveDLByERC from "./services/resolveDLByERC";

const sanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src || ["http", "https"]), "data"],
  },
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...(defaultSchema.attributes?.img || []),
      "data-liferay-src",
      "data-liferay-field",
      "data-liferay-field",
      "data-liferay-scope-key",
      "data-liferay-erc",      
      "data-object-entry-id",
      "data-object-rest-context-path",
      "width",
      "height",
      "style",
    ],
  },
};

function decodeHtmlEntities(str) {
  if (str == null) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

export default function MarkdownRenderer({ value, objectEntryId, objectDefinitionId }) {

  const [objectRestContextPath, setObjectRestContextPath] = useState(null);
  const [objectEntry, setObjectEntry] = useState(null);

  const ctx = useMemo(() => ({ objectEntry, resolveDLByERC }), [objectEntry]);
  const ctxKey = `${objectEntryId ?? ""}:${objectEntry ? "ready" : "loading"}`;

  const decodedValue = useMemo(
    () => decodeHtmlEntities(value ?? ""),
    [value]
  );

  const uriMap = useLiferayUriMap(decodedValue, ctx, ctxKey);

  useEffect(() => {
    if (objectDefinitionId == null) {
      setObjectRestContextPath(null);
      return;
    }

    const graphQLQuery = {
      query: `{
        objectAdmin_v1_0 {
          objectDefinition(objectDefinitionId: ${Number(objectDefinitionId)}) {
            restContextPath
          }
        }
      }`,
    };

    window.Liferay?.Util?.fetch("/o/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphQLQuery),
      credentials: "include",
    })
      .then((r) => r.json())
      .then((json) => {
        console.log("JSON: " + JSON.stringify(json));
        const path =
          json?.data?.objectAdmin_v1_0?.objectDefinition?.restContextPath || null;
        setObjectRestContextPath(path);
      })
      .catch(() => setObjectRestContextPath(null));
  }, [objectDefinitionId]);

  useEffect(() => {

    console.log("ObjectEntryId: " + objectEntryId + " - objectRestContextPath: " + objectRestContextPath);

    if (objectEntryId != null && objectRestContextPath != null) {
      window.Liferay.Util.fetch(`${objectRestContextPath}/${objectEntryId}`)
        .then((r) => {
          return r.json();
        })
        .then((json) => {
          console.log(JSON.stringify(json));
          setObjectEntry(json);
        })
        .catch((err) => {
          console.log(err);
          setObjectEntry(null);
        });
    } else {
      setObjectEntry(null);
    }
  }, [objectEntryId, objectRestContextPath]);

  const rehypePlugins = useMemo(() => {
    return [
      rehypeResolveLiferayUris({ uriMap }),
      [rehypeSanitize, sanitizeSchema],
    ];
  }, [uriMap]);

  return (
    <MarkdownPreview
      source={decodedValue}
      rehypePlugins={rehypePlugins}
    />
  );
}
