import type { ExcalidrawElement, ExcalidrawTextElement, OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';

// // 动态导入 Excalidraw 组件，禁用 SSR
// const Excalidraw = dynamic(() => import('@excalidraw/excalidraw').then(mod => mod.Excalidraw), {
//   ssr: false,
// });

/**
 * 自定义 Hook，用于处理 Mermaid 文本到 Excalidraw 元素的转换
 */
export const useExcalidrawElements = (
  mermaidText: string,
  excalidrawAPI: ExcalidrawImperativeAPI | null
) => {
  const [excalidrawElements, setExcalidrawElements] = useState<ExcalidrawElement[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // 自定义颜色逻辑
  const assignColorsToElements = (elements: ExcalidrawElement[]): OrderedExcalidrawElement[] => {
    return elements.map((element) => {
      const label = (element as ExcalidrawTextElement)?.text || '';
      let fillColor = '#1F2937'; // 默认背景色

      // 根据业务流程节点分配颜色
      if (label.includes('用户')) {
        fillColor = '#124029'; // 用户操作 - 浅绿色
      } else if (label.includes('前端')) {
        fillColor = '#122033'; // 前端操作 - 浅蓝色
      } else if (label.includes('服务端')) {
        fillColor = '#3f1111'; // 服务端操作 - 浅红色
      } else if (label.includes('支付成功')) {
        fillColor = '#28380a'; // 成功状态 - 浅黄绿色
      }

      return {
        ...element,
        backgroundColor: fillColor + '30',
        strokeColor: fillColor,
      } as OrderedExcalidrawElement;
    });
  };

  useEffect(() => {
    const convertMermaidToExcalidraw = async () => {
      try {
        setError(null);

        // 动态加载模块
        const { parseMermaidToExcalidraw } = await import('@excalidraw/mermaid-to-excalidraw');
        const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw');

        const { elements } = await parseMermaidToExcalidraw(mermaidText);
        let excalidrawEls = convertToExcalidrawElements(elements);

        // 添加颜色
        excalidrawEls = assignColorsToElements(excalidrawEls);
        setExcalidrawElements(excalidrawEls);

        // 更新 Excalidraw 场景
        excalidrawAPI?.updateScene({
          elements: excalidrawEls,
        });
      } catch (e) {
        console.error('Error parsing Mermaid to Excalidraw:', e);
        setError(e instanceof Error ? e : new Error('Failed to parse Mermaid to Excalidraw'));
      }
    };

    if (mermaidText) {
      convertMermaidToExcalidraw();
    }
  }, [mermaidText, excalidrawAPI]);

  return { excalidrawElements, error };
};
