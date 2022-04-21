import { $ } from "./dom.js";
import { initRouter, push } from "./router.js";
import { setItem, getItem, removeItem } from "./storage.js";
import {
  getFlattedDocumentList,
  getToggledDocumentList,
  getUpperDocumentList,
} from "./document.js";

export {
  getFlattedDocumentList,
  getToggledDocumentList,
  getUpperDocumentList,
  $,
  initRouter,
  push,
  setItem,
  getItem,
  removeItem,
};
