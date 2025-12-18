import React from "react";
import { createRoot } from "react-dom/client";
import MarkdownEditor from "./MarkdownEditor";
import MarkdownRenderer from "./MarkdownRenderer";

import mdeditorCss from "@uiw-mdeditor-css?raw";
import markdownCss from "@uiw-markdown-css?raw";

class MarkdownEditorWebComponent extends HTMLElement {
    static formAssociated = true;

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
        return this._value;
    }

    set value(v) {
        this._value = v ?? "";
        this._internals.setFormValue(this._value);
    }

    connectedCallback() {
        if (!this._rootInstance) {
            this._rootInstance = createRoot(this._mountPoint);
        }

        this.value = this.textContent ?? this.getAttribute("value") ?? "";

        this._rootInstance.render(
            <MarkdownEditor
                inputValue={this.value}
                placeholder={this.getAttribute("placeholder") ?? ""}
                height={Number(this.getAttribute("height") ?? 200)}
                onValueChange={(next) => {
                    this.value = next;
                    this.dispatchEvent(
                        new CustomEvent("input", {
                            detail: { value: this.value },
                            bubbles: true,
                            composed: true,
                        })
                    );
                }}
            />
        );
    }

    disconnectedCallback() {
        this._rootInstance?.unmount();
        this._rootInstance = null;
    }
}

const MARKDOWN_EDITOR_ELEMENT_ID = "markdown-editor";
if (!customElements.get(MARKDOWN_EDITOR_ELEMENT_ID)) {
    customElements.define(MARKDOWN_EDITOR_ELEMENT_ID, MarkdownEditorWebComponent);
}

class MarkdownRendererWebComponent extends HTMLElement {
    static get observedAttributes() {
        return ["value"];
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
            if (!this.hasAttribute("value")) {
                this._value = this.textContent ?? "";
                this._render();
            }
        });
    }

    get value() {
        return this._value ?? this.getAttribute("value") ?? this.textContent ?? "";
    }

    set value(v) {
        this._value = v ?? "";
        this.setAttribute("value", this._value);
        this._render();
    }

    connectedCallback() {
        if (!this._rootInstance) {
            this._rootInstance = createRoot(this._mountPoint);
        }

        this._value = this.getAttribute("value") ?? this.textContent ?? "";

        this._mo.observe(this, { childList: true, characterData: true, subtree: true });

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
            this._render();
        }
    }

    _render() {
        if (!this._rootInstance) return;

        this._rootInstance.render(<MarkdownRenderer value={this.value} />);

        this.dispatchEvent(
        new CustomEvent("rendered", { detail: { value: this.value }, bubbles: true, composed: true })
        );
    }
}

const MARKDOWN_RENDERER_ELEMENT_ID = "markdown-renderer";
if (!customElements.get(MARKDOWN_RENDERER_ELEMENT_ID)) {
    customElements.define(MARKDOWN_RENDERER_ELEMENT_ID, MarkdownRendererWebComponent);
}