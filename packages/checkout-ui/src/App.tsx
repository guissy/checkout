import { useState } from "react";
import "./App.css";
// 导入 index.ts 中的组件
import * as Components from "./index";
import React from "react";

function App() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  // 定义可以在预览列表中显示的组件
  const supportedComponents = [
    "Button",
    "Input",
    "Arrow",
    "Divider",
    "LoadingDot",
    "LoadingPage",
    "SpinnerAudio",
    "Dialog",
    "SelectSearch",
    "SelectItem",
    "FuturePayLogo",
    "PayToIcon",
    "ArrowBackIcon",
    "SpinnerCycle",
    "CopyButton",
  ];

  // 从 Components 对象中提取组件名称，只保留支持的组件
  const componentNames = Object.keys(Components).filter(
    (name) =>
      supportedComponents.includes(name) &&
      (typeof Components[name as keyof typeof Components] === "function" ||
        typeof Components[name as keyof typeof Components] === "object")
  );

  // 渲染选中的组件
  const renderComponent = (componentName: string) => {
    // 使用类型守卫来处理不同的组件
    switch (componentName) {
      case "Button":
        if ("Button" in Components) {
          const ButtonComponent = Components.Button;
          return (
            <ButtonComponent onClick={() => alert("按钮被点击了")}>
              按钮
            </ButtonComponent>
          );
        }
        break;
      case "Input":
        if ("Input" in Components) {
          const InputComponent = Components.Input;
          return <InputComponent placeholder="请输入内容" />;
        }
        break;
      case "Arrow":
        if ("Arrow" in Components) {
          const ArrowComponent = Components.Arrow;
          return <ArrowComponent direction="right" />;
        }
        break;
      case "Divider":
        if ("Divider" in Components) {
          const DividerComponent = Components.Divider;
          return <DividerComponent />;
        }
        break;
      case "LoadingDot":
        if ("LoadingDot" in Components) {
          const LoadingDotComponent = Components.LoadingDot;
          return <LoadingDotComponent />;
        }
        break;
      case "LoadingPage":
        if ("LoadingPage" in Components) {
          const LoadingPageComponent = Components.LoadingPage;
          return (
            <div
              style={{
                height: "400px",
                width: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <LoadingPageComponent />
            </div>
          );
        }
        break;
      case "SpinnerAudio":
        if ("SpinnerAudio" in Components) {
          const SpinnerAudioComponent = Components.SpinnerAudio;
          return <SpinnerAudioComponent />;
        }
        break;
      case "Dialog":
        if ("Dialog" in Components) {
          return (
            <div/>
          );
        }
        break;
      case "SelectSearch":
        if ("SelectSearch" in Components && "SelectItem" in Components) {
          const SelectSearchComponent = Components.SelectSearch;
          const SelectItemComponent = Components.SelectItem;

          return (
            <SelectSearchComponent
              keyword=""
              onKeywordChange={(value: string) => console.log("搜索:", value)}
              placeholder="请输入搜索内容"
            >
              <SelectItemComponent value="item1" selected={true}>
                选项 1
              </SelectItemComponent>
              <SelectItemComponent value="item2" selected={false}>
                选项 2
              </SelectItemComponent>
              <SelectItemComponent value="item3" selected={false}>
                选项 3
              </SelectItemComponent>
            </SelectSearchComponent>
          );
        }
        break;
      case "CopyButton":
        if ("CopyButton" in Components) {
          const CopyButtonComponent = Components.CopyButton;
          return <CopyButtonComponent spinning={false}>123</CopyButtonComponent>;
        }
        break;
      case "FuturePayLogo":
      case "PayToIcon":
      case "ArrowBackIcon":
      case "SpinnerCycle":
      case "LangEn":
      case "LangZh":
      case "More":
      case "MoreLite":
      case "PayConfirmIcon":
      case "SearchIcon":
      case "SideBg":
        // 渲染SVG图标
        if (componentName in Components) {
          const SvgComponent = Components[
            componentName as keyof typeof Components
          ] as React.FC<React.SVGProps<SVGSVGElement>>;
          return (
            <div className="p-4 border rounded-md bg-gray-50">
              <SvgComponent width={80} height={80} />
            </div>
          );
        }
        break;
      default:
        break;
    }

    return <div>无法渲染 {componentName} 组件</div>;
  };

  return (
    <div className="app-container">
      <header className="preview-header">
        <h1>组件预览</h1>
      </header>

      <div className="preview-content">
        <div className="component-list">
          <h2>组件列表</h2>
          <ul>
            {componentNames.map((name) => (
              <li
                key={name}
                className={activeComponent === name ? "active" : ""}
                onClick={() => setActiveComponent(name)}
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="component-preview min-w-200">
          <h2>预览区域</h2>
          <div className="preview-box">
            {activeComponent ? (
              <div className="component-wrapper">
                <h3>{activeComponent}</h3>
                <div className="component-display text-zinc-500 relative h-full">
                  {renderComponent(activeComponent)}
                </div>
                <div className="props-description">
                  <h4>组件属性说明</h4>
                  <pre>
                    {JSON.stringify(
                      getComponentPropsDescription(activeComponent),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="select-hint">请从左侧选择一个组件进行预览</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 获取组件属性说明
function getComponentPropsDescription(componentName: string) {
  // 根据组件名称返回属性说明
  switch (componentName) {
    case "Button":
      return {
        onClick: "点击按钮时触发的回调函数",
        children: "按钮内容",
        variant:
          "按钮类型，可选值: default, destructive, outline, secondary, ghost, link",
        size: "按钮大小，可选值: default, sm, lg, icon",
        disabled: "是否禁用",
        asChild: "是否作为子元素渲染",
      };
    case "Input":
      return {
        placeholder: "输入框占位文本",
        onChange: "输入框内容变化时的回调",
        defaultValue: "输入框默认值",
        disabled: "是否禁用",
        type: "输入框类型",
      };
    case "Arrow":
      return {
        direction: "箭头方向，可选值: left, right, up, down",
        className: "自定义类名",
      };
    case "Divider":
      return {
        className: "自定义类名",
        thickness: "线条粗细，默认为1",
        dashColor: "线条颜色，默认为#CCCFD5",
        dashLength: "线条段长度，默认为4",
        gapLength: "线条间隙长度，默认为4",
      };
    case "Dialog":
      return {
        组件说明: "Dialog是一个模态对话框组件，包含多个子组件：",
        DialogTrigger: "触发对话框显示的组件",
        DialogContent: "对话框内容容器",
        DialogHeader: "对话框头部",
        DialogTitle: "对话框标题",
        DialogDescription: "对话框描述",
        DialogFooter: "对话框底部",
        DialogClose: "关闭对话框的组件",
      };
    case "SelectSearch":
      return {
        keyword: "搜索关键词",
        onKeywordChange: "关键词变化的回调函数",
        className: "自定义类名",
        listClassName: "列表容器自定义类名",
        placeholder: "搜索框占位文本",
        children: "选项内容，通常是SelectItem组件",
      };
    case "SelectItem":
      return {
        value: "选项值",
        selected: "是否被选中",
        children: "选项内容",
        className: "自定义类名",
      };
    case "LoadingDot":
      return {
        children: "加载内容，可选",
      };
    case "LoadingPage":
      return {
        children: "子元素内容，可选",
      };
    case "SpinnerAudio":
      return {
        说明: "加载中音频条动画组件，无需传入属性",
      };
    case "FuturePayLogo":
    case "PayToIcon":
    case "ArrowBackIcon":
    case "SpinnerCycle":
      return {
        width: "SVG宽度",
        height: "SVG高度",
        className: "自定义类名",
      };
    default:
      return { message: "暂无详细属性说明" };
  }
}

export default App;
