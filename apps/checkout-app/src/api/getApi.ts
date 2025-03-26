export const isProd = () => {
  return new URL(window.location.href)?.hostname.includes(".futurepay.global");
};

const getApi = () => {
  return "http://localhost:4000";
  // return "http://localhost:3000/api";
};

export const getLogApi = () => {
  return "http://localhost:4000";
  // return "http://localhost:3000/api";
};

export const getNmiApi = () => {
  const uri = new URL(window.location.href);
  const hostname = uri.hostname;
  if (
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.startsWith("192.168.")
  ) {
    return "https://api.futurepay-develop.com";
  }
  if (hostname.includes(".futurepay.global")) {
    return "https://api.futurepay.global";
  }
  return "https://api.futurepay-develop.com";
};

export const getApiServer = () => {
  const uri = new URL(window.location.href);
  const hostname = uri.hostname;
  if (
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.startsWith("192.168.")
  ) {
    return "https://api.futurepay-develop.com";
  }
  if (hostname.includes("checkout.futurepay.global")) {
    return "https://api.futurepay.global";
  }
  return "https://api.futurepay-develop.com";
};


export default getApi;
