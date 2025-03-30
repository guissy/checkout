import type { NextConfig } from "next";
import { execSync } from "child_process";
import { writeFileSync } from "node:fs";

const getGitCommitHash = () => {
  try {
    const version = execSync("git rev-parse HEAD").toString().trim();
    writeFileSync("public/git-commit-hash.txt", version);
    return version;
  } catch {
    return "development";
  }
};

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT_HASH: getGitCommitHash(),
  },
  /* config options here */
  experimental: {
    swcPlugins: [
      [
        "@lingui/swc-plugin",
        {
          // 可选配置项
          // 如果需要自定义 runtimeModules 或其他选项，可以在这里添加
          // 例如：
          runtimeModules: {
            i18n: ["@lingui/core", "i18n"],
            trans: ["@lingui/react", "Trans"],
          },
          // stripNonEssentialFields: false // 是否保留非必要字段，默认在生产环境剥离
        },
      ],
    ],
    turbo: {
      rules: {
        "*.po": {
          loaders: ["@lingui/loader"],
          as: "*.js",
        },
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.po$/,
      use: {
        loader: "@lingui/loader",
      },
    });
    // config.module.rules.push({
    //   test: /\.svg$/i,
    //   issuer: /\.[jt]sx?$/,
    //   use: ['@svgr/webpack'],
    // });

    config.module.rules.push({
      test: /\.svg$/,
      resourceQuery: /raw/, // Match ?raw query
      use: [
        {
          loader: "raw-loader",
        },
      ],
    });

    config.module.rules.push({
      test: /\.svg$/,
      resourceQuery: { not: /raw/ }, // 排除 raw
      type: "asset/resource", // 将 SVG 作为静态资源处理
    });

    return config;
  },
};

export default nextConfig;
