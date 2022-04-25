import { request } from "./request.js";

export const getDocument = ({ id }) => request(`/documents/${id}`);

export const getDocumentList = () => request(`/documents`);

export const insertDocument = ({ parentId }) => {
  return request(`/documents`, {
    method: "POST",
    body: JSON.stringify({ title: "", parent: parentId }),
  });
};

export const removeDocument = ({ id }) => {
  return request(`/documents/${id}`, {
    method: "DELETE",
  });
};

export const updateDocument = async ({ id, document }) => {
  return request(`/documents/${id}`, {
    method: "PUT",
    body: JSON.stringify(document),
  });
};

export { request };
