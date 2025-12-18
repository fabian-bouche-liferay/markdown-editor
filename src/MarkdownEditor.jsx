import React from "react";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";

const MarkdownEditor = ({ placeholder, inputValue, height, onValueChange }) => {
    const [value, setValue] = React.useState(inputValue ?? placeholder ?? "");

    React.useEffect(() => {
        setValue(inputValue ?? "");
    }, [inputValue]);

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
                previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
            />
        </div>
    );
};

export default MarkdownEditor;
