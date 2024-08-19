export const getJsonPromise = (url) =>
  fetch(url).then((response) => response.json());
