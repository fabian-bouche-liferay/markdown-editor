import React from "react";
import { createRoot } from "react-dom/client";
import MarkdownEditor from "./MarkdownEditor";
import MarkdownRenderer from "./MarkdownRenderer";

import mdeditorCss from "@uiw-mdeditor-css?raw";
import markdownCss from "@uiw-markdown-css?raw";

/* ------------------------- Markdown Editor Web Component ------------------------- */

class MarkdownEditorWebComponent extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes() {
    return [
      "value",
      "object-entry-id",
      "object-rest-context-path",
      "placeholder",
      "height",
      "name",
      "disabled",
      "readonly",
    ];
  }

  constructor() {
    super();
    this._rootInstance = null;

    this._internals = this.attachInternals();
    this._value = "";

    this._shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `${mdeditorCss}\n${markdownCss}`;
    this._shadow.appendChild(style);

    this._mountPoint = document.createElement("div");
    this._mountPoint.className = "react-root";
    this._shadow.appendChild(this._mountPoint);
  }

  get name() {
    return this.getAttribute("name") ?? "";
  }

  get value() {
    return this._value ?? this.getAttribute("value") ?? this.textContent ?? "";
  }

  set value(v) {
    const next = v ?? "";

    if (next === this._value) return;

    this._value = next;

    this._internals.setFormValue(this._value);

    this.setAttribute("value", this._value);

    this._render();
  }

  connectedCallback() {
    if (!this._rootInstance) {
      this._rootInstance = createRoot(this._mountPoint);
    }

    const initial = this.getAttribute("value") ?? this.textContent ?? "";
    this._value = initial;
    this._internals.setFormValue(this._value);

    this._render();
  }

  disconnectedCallback() {
    this._rootInstance?.unmount();
    this._rootInstance = null;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === "value") {
      const next = newValue ?? "";
      if (next !== this._value) {
        this._value = next;
        this._internals.setFormValue(this._value);
      }
    }

    this._render();
  }

  _getEditorProps() {
    const heightAttr = this.getAttribute("height");
    const height = Number.isFinite(Number(heightAttr)) ? Number(heightAttr) : 200;

    return {
      objectEntryId: this.getAttribute("object-entry-id") ?? undefined,
      objectRestContextPath: this.getAttribute("object-rest-context-path") ?? undefined,
      inputValue: this.value,
      placeholder: this.getAttribute("placeholder") ?? "",
      height,
      disabled: this.hasAttribute("disabled"),
      readOnly: this.hasAttribute("readonly"),
      onValueChange: (next) => {
        this.value = next;

        this.dispatchEvent(
          new CustomEvent("input", {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
          })
        );

        this.dispatchEvent(
          new CustomEvent("change", {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
          })
        );
      },
    };
  }

  _render() {
    if (!this._rootInstance) return;

    const props = this._getEditorProps();

    this._rootInstance.render(<MarkdownEditor {...props} />);
  }
}

const MARKDOWN_EDITOR_ELEMENT_ID = "markdown-editor";
if (!customElements.get(MARKDOWN_EDITOR_ELEMENT_ID)) {
  customElements.define(MARKDOWN_EDITOR_ELEMENT_ID, MarkdownEditorWebComponent);
}

/* ------------------------- Markdown Renderer Web Component ------------------------- */

class MarkdownRendererWebComponent extends HTMLElement {
  static get observedAttributes() {
    return ["value", "object-definition-id", "object-entry-id", "object-rest-context-path", "debug"];
  }

  constructor() {
    super();
    this._rootInstance = null;
    this._value = "";

    this._shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `${mdeditorCss}\n${markdownCss}`;
    this._shadow.appendChild(style);

    this._mountPoint = document.createElement("div");
    this._mountPoint.className = "react-root";
    this._shadow.appendChild(this._mountPoint);

    this._mo = new MutationObserver(() => {
      if (this.hasAttribute("value")) return;

      const next = this.textContent ?? "";
      if (next !== this._value) {
        this._value = next;
        this._render();
      }
    });
  }

  get value() {
    if (this.hasAttribute("value")) return this.getAttribute("value") ?? "";
    return this._value ?? this.textContent ?? "";
  }

  set value(v) {
    const next = v ?? "";
    if (next === this._value && this.getAttribute("value") === next) return;

    this._value = next;
    this.setAttribute("value", next);
    this._render();
  }

  connectedCallback() {
    if (!this._rootInstance) {
      this._rootInstance = createRoot(this._mountPoint);
    }

    this._value = this.hasAttribute("value")
      ? (this.getAttribute("value") ?? "")
      : (this.textContent ?? "");

    this._mo.observe(this, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    this._render();
  }

  disconnectedCallback() {
    this._mo.disconnect();
    this._rootInstance?.unmount();
    this._rootInstance = null;
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;

    if (name === "value") {
      this._value = newVal ?? "";
    }

    this._render();
  }

  _render() {
    if (!this._rootInstance) return;

    const debug =
      this.hasAttribute("debug") &&
      this.getAttribute("debug") !== "false" &&
      this.getAttribute("debug") !== "0";

    this._rootInstance.render(
      <MarkdownRenderer
        value={this.value}
        objectDefinitionId={this.getAttribute("object-definition-id") ?? null}
        objectEntryId={this.getAttribute("object-entry-id") ?? null}
      />
    );

    this.dispatchEvent(
      new CustomEvent("rendered", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }
}

const MARKDOWN_RENDERER_ELEMENT_ID = "markdown-renderer";
if (!customElements.get(MARKDOWN_RENDERER_ELEMENT_ID)) {
  customElements.define(MARKDOWN_RENDERER_ELEMENT_ID, MarkdownRendererWebComponent);
}