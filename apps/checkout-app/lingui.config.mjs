/** @type {import('@lingui/conf').LinguiConfig} */
export default  {
  locales: ["en", "zh"], // 支持的语言列表
  compileNamespace: "ts",
  catalogsMergePath: "<rootDir>/src/locales/ts/{locale}",
  sourceLocale: "en",   // 源语言
  catalogs: [
    {
      path: "<rootDir>/src/locales/po/{locale}", // 消息目录路径
      include: ["src"],                     // 扫描包含的消息文件
    },
  ],
  format: "po", // 推荐使用 PO 文件格式
};