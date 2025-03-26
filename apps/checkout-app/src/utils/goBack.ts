const goBack = (currentOrigin?: string) => {
  // 获取上一页的 URL（referer）
  const referer = document.referrer;
  try {
    if (typeof currentOrigin === 'string') {
      if (!currentOrigin.startsWith("http")) {
        currentOrigin = "https://" + currentOrigin;
      }
      if (!referer || new URL(referer).origin !== new URL(currentOrigin).origin) {
        window.location.href = currentOrigin!;
      } else {
        window.history.back();
      }
    } else {
      // 如果 referer 是当前站点的域名，返回上一页
      window.history.back();
    }
  } catch (error) {
    window.history.back();
    console.warn(error);
  }
};

export default goBack;
