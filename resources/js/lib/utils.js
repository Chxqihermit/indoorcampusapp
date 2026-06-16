import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function isSameUrl(url1, url2) {
  return resolveUrl(url1) === resolveUrl(url2);
}
function resolveUrl(url) {
  return typeof url === "string" ? url : url.url;
}
export {
  cn,
  isSameUrl,
  resolveUrl
};
