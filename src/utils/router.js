const ROUTE_CHANGE_EVENT_NAME = "route-change";

export const initRouter = (onRoute) => {
  console.log("log: router 등록");
  window.addEventListener(ROUTE_CHANGE_EVENT_NAME, (e) => {
    const { nextUrl } = e.detail;
    if (nextUrl) {
      history.pushState(null, null, nextUrl);
      onRoute();
    }
  });
};

export const push = (nextUrl) => {
  console.log("log: router push Event발생 url: ", nextUrl);
  window.dispatchEvent(
    new CustomEvent("route-change", {
      detail: {
        nextUrl,
      },
    })
  );
};
