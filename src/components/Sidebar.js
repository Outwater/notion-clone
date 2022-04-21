import { plusIcon, trashIcon, openToggleSvg, closeToggleSvg } from "../icons/index.js";

export default function Sidebar({
  $target,
  initialState,
  onClickItem,
  onInsertItem,
  onRemoveItem,
  onToggleItem,
}) {
  this.state = initialState; // {documentList: [[{id, title, isToggled,depth}, {}], []]}

  this.template = () => {
    const { documentList, currentDocumentId } = this.state;
    console.log("<<  <sideBar>  렌더링");
    return `
      <div class="flex justify-between p-3">
        <div class="sidebar-title">Outwater의 워크스페이스</div>
        <div id="root-insert-btn" class="icon-container flex-end">${plusIcon}</div>
      </div>
      ${documentList
        .map((rootDocument) =>
          rootDocument
            .map((document) => {
              const { id, title, depth, isView, isOpen, isLastChild } = document;
              return `
              <div class="document depth${depth} ${isView ? "show" : "hide"} 
                ${Number(currentDocumentId) === id ? "active" : ""}" data-id=${id}>
                <div class="sidebar-document-left flex">
                  <div id="toggle-btn" class="icon-container">
                    ${isOpen ? openToggleSvg : closeToggleSvg}
                  </div>
                  <span class="document-title">${title || "제목 없음"}</span>
                </div>
                <div class="sidebar-document-right flex">
                  <div id="remove-btn" class="icon-container flex-end">${trashIcon}</div>
                  <div id="insert-btn" class="icon-container flex-end">${plusIcon}</div>
                </div>
              </div>
              ${
                isLastChild && isView && isOpen
                  ? `<div class="sidebar-last-document depth${depth}">하위페이지가 없습니다.</div>`
                  : ""
              }`;
            })
            .join("")
        )
        .join("")}
    `;
  };
  this.render = () => {
    $target.innerHTML = this.template();
  };
  //- Todo-refactor-05: event처리 가독성 증가
  this.setEvent = () => {
    $target.addEventListener("click", ({ target }) => {
      if (target.closest(`.document-title`)) {
        const { id } = target.closest(".document").dataset;
        onClickItem(id);
        return;
      }
      if (target.closest("#root-insert-btn")) {
        onInsertItem(null);
        return;
      }
      if (target.closest("#insert-btn")) {
        const { id } = target.closest(".document").dataset;
        onInsertItem(id);
        return;
      }
      if (target.closest("#remove-btn")) {
        const { id } = target.closest(".document").dataset;
        onRemoveItem(id);
        return;
      }
      //- TODO_05: 토글에 따른 블록 접기/열기 처리
      if (target.closest("#toggle-btn")) {
        const { id } = target.closest(".document").dataset;
        onToggleItem(id);
        return;
      }
    });
  };

  this.render();
  this.setEvent();
}
