import React, { useMemo, useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
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
      "data-liferay-kind",
      "data-liferay-field",
      "data-liferay-scope-key",
      "data-liferay-erc",      
      "width",
      "height",
      "style",
    ],
  },
};

const MarkdownEditor = ( {objectEntryId, objectRestContextPath, placeholder, inputValue, height, onValueChange} ) => {

  const [value, setValue] = useState(inputValue ?? placeholder ?? "");
  const [objectEntry, setObjectEntry] = useState(null);

  const ctx = useMemo(() => ({
    objectEntry,
    resolveDLByERC,
  }), [objectEntry]);

  const uriMap = useLiferayUriMap(value, ctx);

  useEffect(() => {
    setValue(inputValue ?? "");
  }, [inputValue]);

  useEffect(() => {

    console.log(`${objectRestContextPath}/${objectEntryId}`);

    if(objectEntryId != null && objectRestContextPath != null) {
      window.Liferay.Util.fetch(`${objectRestContextPath}/${objectEntryId}`)
        .then(data => {return data.json()})
        .then(json => {
          setObjectEntry(json);
        });
    }

  }, [objectEntryId, objectRestContextPath]);

  return (
    <div className="container">
      <MDEditor
        value={value}
        onChange={(v) => {
          const next = v ?? "";
          setValue(next);
          onValueChange?.(next);
        }}
        height={height ?? 200}
        previewOptions={{
          rehypePlugins: [
            rehypeResolveLiferayUris({
              uriMap
            }),
            [rehypeSanitize, sanitizeSchema]
          ]
        }}
      />
    </div>
  );
};

export default MarkdownEditor;