const API_END_POINT = "https://kdt-frontend.programmers.co.kr";

export const request = async (url, options) => {
  try {
    const response = await fetch(`${API_END_POINT}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-username": "outwater",
      },
    });

    if (response.ok) {
      return await response.json();
    }
    if (response.status === 404) {
      let err = new Error("존재하지 않는 데이터입니다.");
      err.name = "NoDocumentError";
      throw err;
    }
    throw new Error("API 처리 중 에러 발생!");
  } catch (e) {
    alert(e.message);
    throw e;
  }
};
