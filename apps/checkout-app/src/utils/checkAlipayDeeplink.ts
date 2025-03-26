// 定义错误类型
type DeeplinkError = {
  code: 'TIMEOUT' | 'BLOCKED' | 'NOT_INSTALLED';
  message: string;
};


// 核心检测逻辑
const checkAlipayDeeplink = (deeplinkUrl: string, handleDeeplinkError: (error: DeeplinkError) => void) => {
  const timer: NodeJS.Timeout = setTimeout(() => {
    handleDeeplinkError({
      code: 'TIMEOUT',
      message: '未检测到支付宝响应，可能未安装应用或浏览器拦截'
    });
  }, 5000);

  const successCallback = () => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', visibilityHandler);
  };

  const visibilityHandler = () => {
    if (document.hidden) successCallback();
  };

  // 监听页面可见性变化
  document.addEventListener('visibilitychange', visibilityHandler);

  try {
    // 尝试跳转
    window.location.href = deeplinkUrl;
  } catch (err: unknown) {
    handleDeeplinkError({
      code: 'NOT_INSTALLED',
      message: `支付宝客户端未安装: ${(err as Error).message}`
    });
  }
}

export default checkAlipayDeeplink;
