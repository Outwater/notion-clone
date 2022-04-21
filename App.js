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
  push,
  $,
} from "./src/utils/index.js";

export default function App({ $target }) {
  this.state = {
    documentList: [],
    currentDocumentId: null,
  };

  this.setState = (nextState) => {
    this.state = { ...this.state, ...nextState };
    console.log("!! state변경 <App>: ", this.state);
    this.render();
  };

  this.init = async () => {
    initRouter(() => this.route());
    await updateDocumentList();
    this.route();
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
    //TODO_06: 로컬스토리지 임시데이터 저장 기능
    // let documentLocalSaveKey = `DOCUMENT_SAVE_KEY_${this.state.currentDocumentId}`;

    //Todo-refactor-04: debounce 함수화하여 분리
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
      //TODO_06: localStorage에 최근 작업 id 저장 및 불러오기
      this.setState({
        currentDocumentId: "root",
      });
    } else if (pathname.indexOf("/documents/") === 0) {
      const [, , currentDocumentId] = pathname.split("/");
      //- Todo-refactor-02: routeFirst로 렌더링최적화

      if (currentDocumentId === "null") {
        this.setState({ currentDocumentId: null });
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

  const _onClickItem = (id) => {
    push(`/documents/${id}`);
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
    push(`/documents/${parentItemId || null}`);
    history.replaceState(null, null, `/documents/${parentItemId || null}`);

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
      await updateDocumentList();
    }, 3000);
  };

  this.init();
}
