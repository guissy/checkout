const iv = "paqpe35nids(mZFu";
const key = "2xGN2+0i2VxdkHIfNJcgkw==12345678";

export const decryptAES = async (encryptedText: string): Promise<string> => {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const ivBin = new TextEncoder().encode(iv);
    const keyBin = new TextEncoder().encode(key);
    const cryptKey = await window.crypto.subtle.importKey(
      "raw",
      keyBin,
      { name: "AES-CBC", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // Convert Base64 string to Uint8Array for decryption
    const encryptedBytes = Uint8Array.from(atob(encryptedText), (c) =>
      c.charCodeAt(0)
    );
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: ivBin,
      },
      cryptKey,
      encryptedBytes
    );
    return new TextDecoder("utf-8").decode(decryptedBuffer);
  } else {
    const CryptoJS = (await import("crypto-js")).default;
    const decryptWithCryptoJS = (
      encryptedText: string,
      key: string,
      iv: string
    ) => {
      const keyHex = CryptoJS.enc.Utf8.parse(key);
      const ivHex = CryptoJS.enc.Utf8.parse(iv);

      const decrypted = CryptoJS.AES.decrypt(encryptedText, keyHex, {
        iv: ivHex,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    };
    return decryptWithCryptoJS(encryptedText, key, iv);
  }
};

export const encryptAES = async (plainText: string): Promise<string> => {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const ivBin = new TextEncoder().encode(iv);
    const keyBin = new TextEncoder().encode(key);
    const cryptKey = await window.crypto.subtle.importKey(
      "raw",
      keyBin,
      { name: "AES-CBC", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const encodedText = new TextEncoder().encode(plainText);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: ivBin,
      },
      cryptKey,
      encodedText
    );
    const byteArray = new Uint8Array(encryptedBuffer);
    let binaryStr = "";
    for (let i = 0; i < byteArray.byteLength; i++) {
      binaryStr += String.fromCharCode(byteArray[i]);
    }
    return btoa(binaryStr);
  } else {
    const CryptoJS = (await import("crypto-js")).default;
    const encryptWithCryptoJS = (
      plainText: string,
      key: string,
      iv: string
    ) => {
      const keyHex = CryptoJS.enc.Utf8.parse(key);
      const ivHex = CryptoJS.enc.Utf8.parse(iv);
      const encrypted = CryptoJS.AES.encrypt(plainText, keyHex, {
        iv: ivHex,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return encrypted.toString();
    };
    return encryptWithCryptoJS(plainText, key, iv);
  }
};