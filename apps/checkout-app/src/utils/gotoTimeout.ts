import { isDebug } from "./isDev";
import { removeStorage } from "@/lib/storage";
import { useFormStore } from "../store/useFormStore";

function gotoTimeout(): void {
  try {
    // 重置useFormStore中的状态
    useFormStore.getState().reset();
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
  // 重置useFormStore中的状态
  useFormStore.getState().reset();
  removeStorage("o_d_o");
  removeStorage("p_m_p");
  removeStorage("f_x_f");
  removeStorage("formValue");
  removeStorage("order");
  removeStorage("route");
  removeStorage("country");
  removeStorage("currency");
  removeStorage("outAmount");
  removeStorage("currentPayN");
  removeStorage("currentPay");
  removeStorage("otpFields");
  removeStorage("optRegular");
  removeStorage("btr");
}

export default gotoTimeout;
