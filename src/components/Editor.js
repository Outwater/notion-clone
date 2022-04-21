import Header from "./Header.js";
import { $, push } from "../utils/index.js";
import { getDocument } from "../api/index.js";

//- Todo-refactor-03: app에서 내려온 documentId State와 Editor 내부의 state 구분하기 (보류)
export default function Editor({ $target, initialState, onEditing, onRemoveItem }) {
  this.state = initialState; // { currentDocumentId, document: {title, content} }

  this.setState = (nextState) => {
    this.state = { ...this.state, ...nextState };
    console.log("!! State변경 <Editor>: ", this.state);
    this.render();
  };

  //- TODO_04: 라우트 처리
  this.init = async () => {
    if (this.state.currentDocumentId === "root") {
      $target.innerHTML = `
      <div id="root-page" class="flex-col items-center justify-center">
        <h1> Outwater의 노션에 오신걸 환영합니다. </h1>
        <image src="https://i.ibb.co/C62tsqB/image.jpg" width="100%" height="" />
      </div>`;
      return;
    }
    if (!this.state.currentDocumentId) {
      console.log("log: Editor init: currentDocumentId가 없습니다. ");
      $target.innerHTML = `
      <div id="not-found-page" class="flex-col items-center justify-center">
        <h1>선택된 도큐먼트가 존재하지 않습니다.</h1>
        <p>워크스페이스에서 새로운 도큐먼트를 생성하거나, 클릭하여 수정하십시오.</p>
      </div>
      `;
      return;
    }
    $target.innerHTML = this.template();
    this.mounted();
    try {
      const currentDocument = await getDocument({ id: this.state.currentDocumentId });
      const { title, content } = currentDocument;
      console.log("** fetched Document Data': ", currentDocument);
      $(".editor-title").focus();
      this.setState({ document: { title, content } });
    } catch (e) {
      if (e.name === "NoDocumentError") {
        push(`/documents/null`);
      }
    }
  };

  this.template = () => {
    const { title, content } = this.state.document;
    console.log("<<  <Editor>  렌더링");
    return `
      <header class="editor-header flex justify-between items-center "></header>
      <input class="editor-title mt-20" placeholder="제목 없음" value="${title}" />
      <textarea class="editor-content" placeholder="내용 없음">${content}</textarea>
    `;
  };

  this.render = () => {
    const { title, content } = this.state.document;
    $(".editor-title").value = title;
    $(".editor-content").textContent = content;
  };

  this.mounted = () => {
    new Header({
      $target: $(".editor-header"),
      initialState: {
        id: this.state.currentDocumentId,
      },
      onRemoveItem,
    });
  };
  //- TODO_03: server 데이터와 연동 (디바운스 처리)
  //- Todo-refactor-05: event처리 가독성 증가
  this.setEvent = () => {
    $target.addEventListener("keyup", (e) => {
      const { document, currentDocumentId } = this.state;
      if (!e.target.closest(".editor-title")) return;

      this.setState({
        document: { ...document, title: e.target.value },
      });
      $(`[data-id='${currentDocumentId}'] .document-title`).textContent = e.target.value;
      $(`[data-id='${currentDocumentId}'].editor-header-title`).textContent = e.target.value;
      onEditing(this.state);
    });

    $target.addEventListener("input", (e) => {
      if (!e.target.closest(".editor-content")) return;

      this.setState({
        document: {
          ...this.state.document,
          content: e.target.value,
        },
      });
      onEditing(this.state);
    });
  };

  this.init();
  this.setEvent();
}
