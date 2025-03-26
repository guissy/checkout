import { isDebug } from "./isDev";

function gotoTimeout(): void {
  try {
    window.location.replace("/timeout");
  } catch (error) {
    console.error("Error in gotoTimeout:", error);
  }
}

export function clearSessionStorage(): void {
  if (isDebug()) {
    console.warn("!!!Clearing session storage except debug!!!");
    return;
  }
  window.sessionStorage.removeItem("o_d_o");
  window.sessionStorage.removeItem("p_m_p");
  window.sessionStorage.removeItem("f_x_f");
  window.sessionStorage.removeItem("formValue");
  window.sessionStorage.removeItem("order");
  window.sessionStorage.removeItem("route");
  window.sessionStorage.removeItem("country");
  window.sessionStorage.removeItem("currency");
  window.sessionStorage.removeItem("outAmount");
  window.sessionStorage.removeItem("currentPayN");
  window.sessionStorage.removeItem("currentPay");
  window.sessionStorage.removeItem("otpFields");
  window.sessionStorage.removeItem("optRegular");
  window.sessionStorage.removeItem("btr");
}

export default gotoTimeout;
