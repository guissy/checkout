function getEnvironment() {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile/.test(ua)) {
    return 'WAP';
  } else {
    return 'WEB';
  }
}
function isPhone(): boolean {
  const env = getEnvironment();
  if (env === 'WAP') {
    return true;
  }
  return false;
}
export default isPhone;
