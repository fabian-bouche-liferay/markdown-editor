import 'markdownEditorCX';

let md = fragmentElement.querySelector("span").textContent;
fragmentElement.querySelector("markdown-renderer").textContent = md;