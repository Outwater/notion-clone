function flat(document, depth = 0, flattedDocuments = []) {
  //* 1. 방문한 노드 넣기
  flattedDocuments.push({
    ...document,
    depth,
    isView: true,
    isOpen: false,
    isLastChild: false,
  });

  //* 2. 탈출조건: 자식이 없을 때
  if (document.documents.length === 0) {
    flattedDocuments[flattedDocuments.length - 1].isLastChild = true;
    return flattedDocuments;
  }

  //* 3. 자식노드 있다면 재귀 호출
  document.documents.forEach((childDocument) => {
    flattedDocuments = flat(childDocument, depth + 1, flattedDocuments);
  });

  return flattedDocuments;
}

export const getFlattedDocumentList = (fetchData) => {
  //* fetchData는 rootDocument로 이루어진 배열이다.
  //* rootDocument는 자식 Document를 트리구조로 가지고 있다.
  //* rootDocument를 순회하며, 1depth의 documentList로 풀어주고, 이를 합치는 동작
  //* Input: [[root1 : [child1, child2]], [root2 : [child3 : [grandChild1]]], ... ]
  //* Output: [[root1, child1, child2], [root2, child3, grandChild1], ... ]
  return fetchData.map((rootDocument) => flat(rootDocument, 0, []));
};

const getClickedPosition = (documentList, clickedId) => {
  let parentIdx;
  let childIdx;
  documentList.forEach((rootDocument, pIdx) => {
    rootDocument.forEach((childDocument, cIdx) => {
      if (childDocument.id === Number(clickedId)) {
        parentIdx = pIdx;
        childIdx = cIdx;
      }
    });
  });
  return [parentIdx, childIdx];
};

export const getToggledDocumentList = (documentList, clickedId) => {
  const [parentIdx, childIdx] = getClickedPosition(documentList, clickedId);
  const clickedDocument = documentList[parentIdx][childIdx];

  if (clickedDocument.isOpen) {
    for (let p = 0; p < documentList.length; p++) {
      if (p !== parentIdx) continue; // 루트 도큐먼트가 다르면 Pass

      for (let c = 0; c < documentList[p].length; c++) {
        let currentDocument = documentList[p][c];
        if (c > childIdx && currentDocument.depth > clickedDocument.depth) {
          currentDocument.isView = false;
          currentDocument.isOpen = false;
        }
      }
      break;
    }
  } else {
    for (let p = 0; p < documentList.length; p++) {
      if (p !== parentIdx) continue; // 루트 도큐먼트가 다르면 Pass

      for (let c = 0; c < documentList[p].length; c++) {
        let currentDocument = documentList[p][c];
        if (c > childIdx && currentDocument.depth === clickedDocument.depth + 1) {
          if (currentDocument.depth < clickedDocument.depth) {
            break;
          }
          currentDocument.isView = true;
        }
      }
      break;
    }
  }
  clickedDocument.isOpen = !clickedDocument.isOpen;
  return documentList;
};

export const getUpperDocumentList = (documentList, documentId) => {
  let upperDocumentList = [];

  const findDocument = (document, targetId, visitedDocumentList) => {
    if (document.id === targetId) {
      upperDocumentList = [...visitedDocumentList, document];
      return;
    }
    if (document.documents.length > 0) {
      document.documents.forEach((childDocument) => {
        findDocument(childDocument, targetId, [...visitedDocumentList, document]);
      });
    }
  };

  documentList.forEach((rootDocument) => {
    findDocument(rootDocument, documentId, []);
  });
  return upperDocumentList;
};
