export const $ = (selector, $target) => {
  if ($target) {
    return $target.querySelector(selector);
  }

  return document.querySelector(selector);
};
