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
    alert(
      `   contentEditable 기능이 추가되었습니다.
      작성한 글을 드래그하여, 다양한 editable 버튼을 사용해보세요!`
    );
  };

  this.template = () => {
    console.log("<< <App> 렌더링");
    return `
    <div class="app-container flex">
      <section class="sidebar-section flex-col p-10"></section>
      <section class="editor-section flex-col py-10"></section>
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
      //- TODO_4: url path 및 라우트 관련 처리
      onClickItem: (id) => _onClickItem(id),
      //- TODO_2-1: add 처리
      onInsertItem: (id) => _onInsertItem(id),
      //- TODO_2-2: remove 처리
      onRemoveItem: (id) => _onRemoveItem(id),
      //- TODO_05: 토글에 따른 접고펼치기 기능
      onToggleItem: (id) => _onToggleItem(id),
    });

    // Todo-refactor-04: debounce 함수화하여 분리
    //- Todo-refactor-03: editor state와 app State 구분 (보류)
    new Editor({
      $target: $(".editor-section"),
      initialState: {
        currentDocumentId: this.state.currentDocumentId,
        document: {
          title: "",
          content: "",
        },
      },
      //- TODO_03: Editor serverData 연동 & 디바운스 관련 처리
      onEditing: ({ currentDocumentId, document }) => _onEditing(currentDocumentId, document),
      onRemoveItem: (id) => _onRemoveItem(id),
    });
  };

  this.route = () => {
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
      //- Todo-refactor-02: routeFirst로 렌더링최적화

      if (currentDocumentId === "notFound") {
        this.setState({ currentDocumentId: "notFound" });
        return;
      }
      if (this.state.currentDocumentId !== currentDocumentId) {
        this.setState({ currentDocumentId });
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
    await updateDocumentList();
  };

  const _onInsertItem = async (id) => {
    const parentId = id ? Number(id) : null;
    const insertedItem = await insertDocument({ parentId });
    console.log("** insertedItem: ", insertedItem);
    push(`/documents/${insertedItem.id}`);

    await updateDocumentList();
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
