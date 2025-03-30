import type { UserConfig } from "@commitlint/types";

const configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复问题
        "docs", // 文档变更
        "style", // 代码风格变更(不影响功能)
        "refactor", // 代码重构
        "perf", // 性能优化
        "test", // 测试相关
        "build", // 构建系统或外部依赖变更
        "ci", // CI配置变更
        "chore", // 其他修改
        "revert", // 恢复先前的提交
      ],
    ],
    // "scope-enum": [2, "always", ["core", "ui", "api", "docs", "tests"]],
  },
};

export default configuration;
