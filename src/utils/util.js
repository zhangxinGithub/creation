export const getImageUrl = (path) => {
  return new URL(`/src/assets/img/${path}`, import.meta.url).href;
};
