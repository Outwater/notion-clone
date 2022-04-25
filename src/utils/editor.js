export const focusEndOfContenteditable = (contentEditableElement) => {
  let range, selection;
  range = document.createRange();

  range.selectNodeContents(contentEditableElement);
  range.collapse(false);
  selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};
