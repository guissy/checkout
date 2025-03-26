"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { checkoutFlowchart } from "@/lib/flowchartData";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import fetchLogList from "@/api/fetchLogList";
import fetchDeepseek from "@/api/fetchDeepseek";
import { Arrow, SpinnerCycle } from "checkout-ui";
import { z } from "zod";
import { parse } from "json2csv";
import { useExcalidrawElements } from "./hooks/useExcalidrawElements";
import { CheckoutLog } from "@/api/generated/check_log";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-100 h-96 rounded-lg"></div>
    ),
  }
);

const MainMenu = dynamic(
  async () => (await import("@excalidraw/excalidraw")).MainMenu,
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-100 h-96 rounded-lg"></div>
    ),
  }
);

export default function ExcalidrawFlowchartPage() {
  const [logText, setLogText] = useState("");
  const [mermaidText, setMermaidText] = useState('');
  const excalidrawWrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<CheckoutLog[]>([]);
  const CheckoutLogParamSchema = z.array(
    z.object({
      requestTag: z.string(),
      requestMethod: z.string(),
      requestUrl: z.string(),
      requestTime: z.string(),
      responseTime: z.string(),
      responseStatus: z.string(),
      responseInterval: z.number(),
    })
  ); // 确保只允许定义的字段
  useEffect(() => {
    setLoading(true);
    fetchLogList().then((res) => {
      try {
        const logs = CheckoutLogParamSchema.safeParse(res.data);
        const csv = parse(logs.data!);
        setLogs(logs.data as unknown as CheckoutLog[]);
        const logContent = csv.replaceAll("http://localhost:4000/", "");
        const prompt = `Mermaid语法流程图示例：${checkoutFlowchart}\n\n根据以下CSV格式的API日志，请整理一个流程图，只需要流程图，不要包含任何其他解释说明！\n\n` +
            logContent;
        setLogText(prompt);
        fetchDeepseek(prompt).then((content) => {
          setMermaidText(
            (content as unknown as string)
              .replaceAll("```mermaid", "")
              .replaceAll("```", "")
          );
          setLoading(false);
        });
      } catch (e) {
        console.error("Error parsing Mermaid to Excalidraw:", e);
      }
    });
  }, [CheckoutLogParamSchema]);
  // 更新 Excalidraw 容器的尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (excalidrawWrapperRef.current) {
        setDimensions({
          width: excalidrawWrapperRef.current.offsetWidth,
          height: excalidrawWrapperRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { excalidrawElements } = useExcalidrawElements(
    mermaidText,
    excalidrawAPI
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold text-center mb-0">
          在 DeepSeek 加持下，从API日志生成流程图
        </h1>
        {loading && <SpinnerCycle className="text-3xl animate-spin" />}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex items-center gap-1 mb-6">
          {/* 查询请求接口日志内容 */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-3">查询请求接口日志内容</h2>
            <textarea
              value={logText}
              readOnly
              className="w-full h-64 p-4 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm whitespace-pre"
              placeholder="在这里输入接口日志内容..."
            />
            <div className="mt-2 text-sm text-gray-500">
              共用日志：{logs.length}条
            </div>
          </div>
          <div className="w-8">
            <Arrow direction="right" className="text-3xl block mx-auto" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-3">
              生成 Mermaid 流程图代码
            </h2>
            <textarea
              value={mermaidText}
              onChange={(e) => {
                setMermaidText(e.target.value);
              }}
              className="w-full h-64 p-4 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm"
              placeholder="在这里输入 Mermaid 语法的流程图代码..."
            />
            <div className="mt-2 text-sm text-gray-500">
              输入 Mermaid 语法的流程图代码，例如：graph TD{";"} A[开始] --{">"}{" "}
              B[结束]
              <a
                href="https://mermaid.js.org/intro/syntax-reference.html"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-500 hover:underline"
              >
                查看语法参考
              </a>
            </div>
          </div>
        </div>

        {/* Excalidraw 流程图展示 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            流程图预览 (Excalidraw)
          </h2>
          <div
            ref={excalidrawWrapperRef}
            className="border border-gray-200 rounded-lg overflow-hidden excalidraw-wrapper"
            style={{ height: "600px", position: "relative" }}
          >
            <div
              style={{ width: "100%", height: "100%", position: "absolute" }}
            >
              {excalidrawElements?.length > 0 && (
                <Excalidraw
                  initialData={{
                    elements: excalidrawElements,
                    appState: {
                      viewBackgroundColor: "#FFFFFF",
                      theme: "light",
                      currentItemFontFamily: 1,
                      name: "支付流程图",
                      ...dimensions,
                    },
                    scrollToContent: true,
                  }}
                  UIOptions={{
                    canvasActions: {
                      export: { saveFileToDisk: true },
                      loadScene: true,
                      saveToActiveFile: false,
                      toggleTheme: false,
                    },
                    tools: { image: false },
                  }}
                  excalidrawAPI={(api) => setExcalidrawAPI(api)}
                >
                  <MainMenu />
                </Excalidraw>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* 说明部分 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">关于 Excalidraw 流程图</h2>
        <p className="mb-4">
          本页面使用 Excalidraw 来绘制流程图。Excalidraw
          是一个虚拟白板，它可以让你轻松地创建和分享手绘风格的图表。
          您可以使用上面的编辑器查看 Mermaid 格式的流程图代码，并在 Excalidraw
          画布上创建相应的图表。
        </p>
        <h3 className="text-lg font-semibold mt-4 mb-2">如何使用</h3>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>可以参考左侧的 Mermaid 代码来了解流程图结构</li>
          <li>使用 Excalidraw 画布上的工具创建流程图</li>
          <li>可以拖动元素、调整大小和样式</li>
          <li>使用箭头工具连接各个元素</li>
          <li>可以通过导出按钮保存图片</li>
        </ol>
      </div>
    </div>
  );
}
