import isDev from "../utils/isDev";
import fetchLog from "./fetchLog";
import formatDate from "../utils/formatDate";

let hasInit = false;
let token: string | undefined;
let origin: string | undefined;
let downstreamOrderNo: string | undefined;

const getArmsRum = async () => {
  const ArmsRum = await import("@arms/rum-browser").then((module) => {
    return module.default;
  });
  const env = window.location.hostname.includes(".global")
    ? "prod"
    : window.location.hostname.includes("develop")
      ? "pre"
      : "local";
  const base = {
    endpoint: "https://1mrg1kiei333-default-sea.rum.aliyuncs.com",
    env,
  } as const;
  const config = {
    prod: {
      ...base,
      pid: "1mrg1kiei33@6511f26277c3ab0",
    },
    pre: {
      ...base,
      pid: "1mrg1kiei33@60db669dc633753",
    },
    local: {
      ...base,
      pid: "1mrg1kiei33@de46f0e5e9bcd56",
    },
  };
  if (!hasInit) {
    hasInit = true;
    ArmsRum.init(config[env as keyof typeof config]);
  }
  return ArmsRum;
};

export const reportEvent = async (name: string, params: {
  [s: string]: unknown;
} | { value?: number }) => {
  if (typeof window === 'undefined') return; // 服务器端直接跳过
  try {
    if (isDev()) console.log("Reporting event", name, params);
    const ArmsRum = await getArmsRum();
    ArmsRum.sendCustom({
      type: name.split("_").shift()!,
      name: name,
      group: Object.values(params)?.[0] as string,
      value: params.value as number ?? Number(Object.values(params)?.[0]) as number,
    });
  } catch (error) {
    console.error("Error reporting event", error);
  }
};

export const reportError = async (
  name: string,
  code: string,
  message: string,
  params: unknown,
) => {
  try {
    if (typeof window === 'undefined') return; // 服务器端直接跳过
    if (isDev()) console.log("Reporting error", name, message, params);
    const ArmsRum = await getArmsRum();
    ArmsRum.sendException({
      name: name,
      message: message,
      file: code,
      stack: JSON.stringify(params) + "\\n    at <anonymous>:1:1",
    });
  } catch (error) {
    console.error("Error reporting error", error);
  }
};
type FetchLogParams = {
  remark: string;
  duration: number;
  url: string;
  method: string;
  requestTime: number;
  responseTime: number;
  requestHeader: string;
  requestBody: string;
  responseMessage: string;
  responseStatus: number;
  success: 0 | 1;
};
export const reportResource = async (name: string, params: FetchLogParams) => {
  if (typeof window === 'undefined') return; // 服务器端直接跳过
  try {
    // if (isDev()) console.log("Reporting api", name, params);
    void fetchLog({
      param: {
        origin: origin!,
        requestTag: name,
        requestMethod: params.method,
        requestUrl: params.url,
        requestTime: formatDate(new Date(params.requestTime)),
        requestHeader: params.requestHeader?.slice(0, 1000) ?? "",
        requestBody: params.requestBody?.slice(0, 1000) ?? "",
        responseTime: formatDate(new Date(params.responseTime)),
        responseMessage: params.responseMessage?.slice(0, 1000) ?? "",
        responseStatus: String(params.responseStatus),
        responseInterval: params.duration,
        remark: params.remark,
        token: token!,
        downstreamOrderNo: downstreamOrderNo!,
      },
    });
    // const ArmsRum = await getArmsRum();
    // ArmsRum.sendResource({
    //   success: 1,
    //   name: name,
    //   message: "",
    //   duration: params.duration,
    //   url: params.url,
    //   method: params.method,
    // });
  } catch (error) {
    console.error("Error reporting api", error);
  }
};

export const reportUser = async (name: string, params: {
  token?: string, origin?: string, amount: number, currency: string, merchantId: string, productId: string }) => {
  if (typeof window === 'undefined') return; // 服务器端直接跳过
  try {
    downstreamOrderNo = name;
    token = params.token;
    origin = params.origin;
    const ArmsRum = await getArmsRum();
    const config = ArmsRum.getConfig();

    ArmsRum.setConfig({
      ...config,
      version: "v1.0.0",
      user: {
        ...config.user,
        name: name,
        tags: Object.values(params).join(","),
      },
    });
  } catch (error) {
    console.error("Error setting user", error);
  }
};

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { type Analytics, getAnalytics, logEvent } from "firebase/analytics";
// // https://firebase.google.com/docs/web/setup#available-libraries
//
// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyC9jv_gkSscVT3w7vWe592mL5-ECavZ99w",
//   authDomain: "fpcheckout-4268c.firebaseapp.com",
//   projectId: "fpcheckout-4268c",
//   storageBucket: "fpcheckout-4268c.appspot.com",
//   messagingSenderId: "1055776441249",
//   appId: "1:1055776441249:web:965f66b42a7002ffb7c1e0",
//   measurementId: "G-CQW255N894"
// };
//
// // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // const analytics = getAnalytics(app);
// let cache: Analytics;
// const getFirebaseAnalytics = () => {
//   if (!cache) {
//     cache = getAnalytics(initializeApp(firebaseConfig));
//   }
//   return cache;
// };
