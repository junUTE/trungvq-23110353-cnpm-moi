const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL_DEFAULT ||
  "";

export const resolveMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${backendBaseUrl}${url}`;
};
