import React from "react";
import MDEditor from "@uiw/react-md-editor";

const MarkdownRenderer = ({ value }) => {
  return <MDEditor.Markdown source={value ?? ""} style={{ whiteSpace: "pre-wrap" }} />;
};

export default MarkdownRenderer;