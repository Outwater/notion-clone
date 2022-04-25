import { getDocumentList } from "../api/index.js";
import { getUpperDocumentList, removeItem, push } from "../utils/index.js";
import { homeIcon, trashIcon } from "../icons/index.js";
import { RECENT_DOCUMENT_SAVE_KEY } from "../constants/index.js";

export default function Header({ $target, initialState, onRemoveItem }) {
  this.state = initialState; //{id: currentDocumentId}

  this.render = async () => {
    $target.innerHTML = this.template([]);
    // fetch받아오는 동안그려줌
    const documentList = await getDocumentList();
    const upperDocumentList = await getUpperDocumentList(documentList, Number(this.state.id));
    $target.innerHTML = this.template(upperDocumentList);
  };

  this.template = (documentList) => {
    return `
      <div class='flex'>
        ${documentList
          .map((document, idx, dList) => {
            return `
            <div class='editor-header-title py-5' data-id=${document.id}>
              ${document.title || "제목 없음"}
            </div>
            ${
              dList.length - 1 !== idx ? "<span style='color:rgba(55, 53, 47, 0.3)'> / </span>" : ""
            }`;
          })
          .join("")}
      </div>
      <div class='flex'>
        <div id='home-btn' class='icon-container'>
          ${homeIcon}
        </div>
        <div id='trash-btn' class='icon-container'>
          ${trashIcon}
        </div>
      </div>
    `;
  };

  this.setEvent = () => {
    $target.addEventListener("click", async ({ target }) => {
      if (target.closest(`.editor-header-title`)) {
        const { id } = target.closest(".editor-header-title").dataset;
        if (id === this.state.id) return;
        push(`/documents/${id}`);
      }

      if (target.closest(`#trash-btn`)) {
        const isConfirm = confirm("정말로 삭제하시겠습니까?");
        if (!isConfirm) return;
        onRemoveItem(this.state.id);
      }

      if (target.closest(`#home-btn`)) {
        removeItem(RECENT_DOCUMENT_SAVE_KEY);
        push("/");
      }
    });
  };

  this.setEvent();
  this.render();
}
