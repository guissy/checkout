import CryptoJS from 'crypto-js';

/**
 * Encrypt a message using 3DES (Triple DES) with CBC mode and PKCS7 padding.
 * @param {string} messageToEncrypt - The message to encrypt.
 * @param {string} secret - The secret key (24 characters for 3DES).
 * @returns {string} - The encrypted message in Base64 format.
 * @throws {Error} - If any cryptographic operation fails.
 */
export function encrypt3DES(messageToEncrypt: string, secret: string) {
  if (secret.length !== 24) {
    throw new Error('Secret key must be 24 characters long for 3DES');
  }

  const key = CryptoJS.enc.Utf8.parse(secret); // Convert string to WordArray
  const iv = CryptoJS.enc.Utf8.parse(secret.slice(0, 8)); // Use the first 8 characters as IV

  const encrypted = CryptoJS.TripleDES.encrypt(messageToEncrypt, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7 // Use PKCS7 padding, equivalent to PKCS5 for 3DES
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

/**
 * Decrypt a message using 3DES (Triple DES) with CBC mode and PKCS7 padding.
 * @param {string} encryptedBase64 - The encrypted message in Base64 format.
 * @param {string} secret - The secret key (24 characters for 3DES).
 * @returns {string} - The decrypted message.
 * @throws {Error} - If any cryptographic operation fails.
 */
export function decrypt3DES(encryptedBase64: string, secret: string) {
  if (secret.length !== 24) {
    throw new Error('Secret key must be 24 characters long for 3DES');
  }

  const key = CryptoJS.enc.Utf8.parse(secret); // Convert string to WordArray
  const iv = CryptoJS.enc.Utf8.parse(secret.slice(0, 8)); // Use the first 8 characters as IV

  const decrypted = CryptoJS.TripleDES.decrypt(encryptedBase64, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7 // Use PKCS7 padding, equivalent to PKCS5 for 3DES
  });

  return decrypted.toString(CryptoJS.enc.Utf8); // Output in UTF-8 format
}

//  function test(messageToEncrypt: string, secret: string, expectedEncryptedMessage: string) {
//   const encryptedMessage = encrypt3DES(messageToEncrypt, secret);
//   console.log('Encrypted message:', encryptedMessage, encryptedMessage === expectedEncryptedMessage ? "\u2714" : "\u2718");
//
//   const decryptedMessage = decrypt3DES(encryptedMessage, secret);
//   console.log('Decrypted message:', decryptedMessage);
// }
//
// test("123", "2xGN2+0i2VxdkHIfNJcgkw==", "JnpHVpRx/dc=")

