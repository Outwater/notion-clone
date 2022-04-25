import Header from "./Header.js";
import { $, push, focusEndOfContenteditable } from "../utils/index.js";
import { getDocument } from "../api/index.js";

export default function Editor({ $target, initialState, onEditing, onRemoveItem }) {
  this.state = initialState;
  // { currentDocumentId, document: {title, content} }

  this.setState = (nextState) => {
    this.state = { ...this.state, ...nextState };
  };

  this.init = async () => {
    if (this.state.currentDocumentId === "root") {
      $target.innerHTML = `
      <div id="root-page" class="flex-col items-center justify-center">
        <h1> Outwater의 노션에 오신걸 환영합니다. </h1>
        <image src="https://i.ibb.co/C62tsqB/image.jpg" width="100%" height="" />
      </div>`;
      return;
    }
    if (this.state.currentDocumentId === "notFound") {
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
      this.setState({ document: { title, content } });
      this.render();

      if (!title) {
        $(".editor-title").focus();
      } else {
        focusEndOfContenteditable($(".editor-content"));
      }
    } catch (e) {
      if (e.name === "NoDocumentError") {
        push(`/documents/notFound`);
      }
    }
  };

  this.template = () => {
    const { title } = this.state.document;
    console.log("<<  <Editor>  렌더링");
    return `
      <header class="editor-header flex justify-between items-center "></header>
      <input class="editor-title mt-20" placeholder="제목 없음" value="${title}" />

      <div class="editor-btn-box visible-off">
        <div class="editor-btn" id="btn-text"> T </div> <div class="editor-btn" id="btn-h2"> H2 </div> <div class="editor-btn" id="btn-h3"> H3 </div>
        <div class="editor-btn" id="btn-bold"> <b>B</b> </div> <div class="editor-btn" id="btn-italic"> <i>I</i> </div>
        <div class="editor-btn" id="btn-underline"> <u>U</u> </div> <div class="editor-btn" id="btn-strike"> <s>S</s> </div>
        <div class="editor-btn" id="btn-ordered-list"> OL </div> <div class="editor-btn" id="btn-unordered-list"> UL </div>
        <div class="editor-btn" id="btn-code"> < > </div>
      </div>
      <div class="editor-content" id=".editor-content" contenteditable="true"></div>
    `;
  };
  this.render = () => {
    const { title, content } = this.state.document;
    $(".editor-title").value = title;
    $(".editor-content").innerHTML = content;
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
  this.setEvent = () => {
    $target.addEventListener("mouseup", (e) => {
      let currText = document.getSelection().toString();
      if (currText.length > 0) {
        $(".editor-btn-box").classList.add("visible-on");
      }
    });

    $target.addEventListener("keyup", (e) => {
      const { document, currentDocumentId } = this.state;
      if (e.target.closest(".editor-content")) {
        this.setState({ document: { ...document, content: e.target.innerHTML } });
        onEditing(this.state);
      }
      if (e.target.closest(".editor-title")) {
        this.setState({
          document: { ...document, title: e.target.value },
        });
        $(`[data-id='${currentDocumentId}'] .document-title`).textContent = e.target.value;
        $(`[data-id='${currentDocumentId}'].editor-header-title`).textContent = e.target.value;
        onEditing(this.state);
      }
    });

    $target.addEventListener("mousedown", ({ target }) => {
      const setStyle = (style, isCustom = false) => {
        if (!isCustom) {
          document.execCommand(style);
        } else {
          if (style === "text") {
            document.execCommand("formatBlock", false, "div");
            document.execCommand("backColor", false, "white");
            document.execCommand("foreColor", false, "black");
            document.execCommand("fontSize", false, "3");
          } else if (style === "h2") {
            document.execCommand("formatBlock", false, "h2");
          } else if (style === "h3") {
            document.execCommand("formatBlock", false, "h3");
          } else if (style === "codeBlock") {
            document.execCommand("backColor", false, "rgba(135,131,120,0.15)");
            document.execCommand("foreColor", false, "#EB5757");
            document.execCommand("fontSize", false, "2");
          }
        }
        this.setState({
          document: { ...document, content: $(".editor-content").innerHTML },
        });
        onEditing(this.state);
      };

      if (target.closest("#btn-bold")) {
        setStyle("bold");
      } else if (target.closest("#btn-italic")) {
        setStyle("italic");
      } else if (target.closest("#btn-underline")) {
        setStyle("underline");
      } else if (target.closest("#btn-strike")) {
        setStyle("strikeThrough");
      } else if (target.closest("#btn-ordered-list")) {
        setStyle("insertOrderedList");
      } else if (target.closest("#btn-unordered-list")) {
        setStyle("insertUnorderedList");
      } else if (target.closest("#btn-text")) {
        setStyle("text", true);
      } else if (target.closest("#btn-h2")) {
        setStyle("h2", true);
      } else if (target.closest("#btn-h3")) {
        setStyle("h3", true);
      } else if (target.closest("#btn-code")) {
        setStyle("codeBlock", true);
      }
      $(".editor-btn-box").classList.remove("visible-on");
    });
  };

  this.init();
  this.setEvent();
}
