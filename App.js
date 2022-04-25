import Sidebar from "./src/components/Sidebar.js";
import Editor from "./src/components/Editor.js";
import {
  getDocumentList,
  insertDocument,
  removeDocument,
  updateDocument,
} from "./src/api/index.js";
import {
  getFlattedDocumentList,
  getToggledDocumentList,
  initRouter,
  getItem,
  setItem,
  push,
  $,
} from "./src/utils/index.js";
import { RECENT_DOCUMENT_SAVE_KEY } from "./src/constants/index.js";

export default function App({ $target }) {
  this.state = {
    documentList: [],
    currentDocumentId: "root",
  };

  this.setState = (nextState) => {
    this.state = { ...this.state, ...nextState };
    console.log("!! state변경 <App>: ", this.state);
    this.render();

    const { currentDocumentId } = this.state;
    if (currentDocumentId !== "root" && currentDocumentId !== "notFound") {
      setItem(RECENT_DOCUMENT_SAVE_KEY, currentDocumentId);
    }
  };

  this.init = async () => {
    initRouter(() => this.route());
    await updateDocumentList();
    this.route();
    alert(`contentEditable 기능이 추가되었습니다. 
작성한 글을 드래그하여, 다양한 editable 버튼을 사용해보세요!`);
  };

  this.template = () => {
    console.log("<< <App> 렌더링");
    return `
    <div class="app-container flex">
      <section class="sidebar-section flex-col p-10"></section>
      <section class="editor-section flex-col py-15"></section>
    </div>
    `;
  };

  this.render = () => {
    $target.innerHTML = this.template();
    this.mounted();
  };

  this.mounted = () => {
    new Sidebar({
      $target: $(".sidebar-section"),
      initialState: {
        documentList: this.state.documentList,
        currentDocumentId: this.state.currentDocumentId,
      },
      onClickItem: (id) => _onClickItem(id),
      onInsertItem: (id) => _onInsertItem(id),
      onRemoveItem: (id) => _onRemoveItem(id),
      onToggleItem: (id) => _onToggleItem(id),
    });

    new Editor({
      $target: $(".editor-section"),
      initialState: {
        currentDocumentId: this.state.currentDocumentId,
        document: { title: "", content: "" },
      },
      onEditing: ({ currentDocumentId, document }) => _onEditing(currentDocumentId, document),
      onRemoveItem: (id) => _onRemoveItem(id),
    });
  };

  this.route = async () => {
    const { pathname } = window.location;
    console.log("log: route 실행: ", pathname);
    if (pathname === "/") {
      const currentDocumentId = getItem(RECENT_DOCUMENT_SAVE_KEY, "root");
      if (currentDocumentId !== "root") {
        alert("최근 작업 문서를 불러옵니다.");
        history.pushState(null, null, `/documents/${currentDocumentId}`);
      }
      this.setState({ currentDocumentId });
      return;
    }

    if (pathname.indexOf("/documents/") === 0) {
      const [, , currentDocumentId] = pathname.split("/");

      if (currentDocumentId === "notFound") {
        this.setState({ currentDocumentId: "notFound" });
        return;
      }
      if (this.state.currentDocumentId !== currentDocumentId) {
        const fetchData = await getDocumentList();
        this.setState({ currentDocumentId, documentList: getFlattedDocumentList(fetchData) });
      }
    }
  };

  const updateDocumentList = async () => {
    const fetchData = await getDocumentList();
    console.log("** fetched All Documents: ", fetchData);
    this.setState({ documentList: getFlattedDocumentList(fetchData) });
  };

  const _onClickItem = async (id) => {
    push(`/documents/${id}`);
  };

  const _onInsertItem = async (id) => {
    const parentId = id ? Number(id) : null;
    const insertedItem = await insertDocument({ parentId });
    console.log("** insertedItem: ", insertedItem);
    push(`/documents/${insertedItem.id}`);
  };

  const _onRemoveItem = async (id) => {
    const removedItem = await removeDocument({ id });
    console.log("** removedItem: ", removedItem);
    const parentItemId = removedItem.parent?.id;
    push(`/documents/${parentItemId || "notFound"}`);
    history.replaceState(null, null, `/documents/${parentItemId || "notFound"}`);

    await updateDocumentList();
  };

  const _onToggleItem = (id) => {
    this.setState({
      documentList: getToggledDocumentList(this.state.documentList, id),
    });
  };

  let timer = null;
  const _onEditing = async (currentDocumentId, document) => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(async () => {
      console.log("** 수정 API : ", [currentDocumentId, document]);
      await updateDocument({ id: currentDocumentId, document });
    }, 3000);
  };

  this.init();
}
