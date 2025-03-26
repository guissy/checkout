export const checkoutFlowchart = `graph TD
    A[用户选择支付方式] -->|GET /checkout/paymentMethod| B(服务端返回支付方式列表)
    B --> C[用户确认支付信息]
    C -->|POST /checkout/paymentInfo| D{服务端处理支付请求}
    D -->|支付请求提交成功| E[前端查询订单状态]
    E -->|GET /checkout/orderStatus| F{服务端返回订单状态}
    F -->|订单状态: PENDING| G[前端开始轮询订单状态]
    G -->|每5秒一次 GET /checkout/orderStatus| H{服务端返回最新订单状态}
    H -->|订单仍处于 PENDING| G
    H -->|订单状态发生变更| I[前端获取最终订单状态]
    I -->|GET /checkout/orderStatus| J{服务端返回最终状态}
    J -->|支付成功| K[前端跳转支付成功页]
    K -->|GET /success?reference=xxx| L(服务端返回支付成功)`;

export const simpleFlowchart = `graph TD
    A[开始] --> B[步骤 1]
    B --> C[步骤 2]
    C --> D[结束]`;

export const paymentFlowchart = `sequenceDiagram
    参与者 客户端
    参与者 服务器
    客户端->>服务器: 发送支付请求
    服务器->>客户端: 返回支付链接
    客户端->>客户端: 跳转到支付页面
    客户端->>服务器: 轮询支付状态
    服务器->>客户端: 返回支付状态
    客户端->>客户端: 显示支付结果`;

export const getFlowchartByType = (type: string) => {
  switch (type) {
    case 'checkout':
      return checkoutFlowchart;
    case 'simple':
      return simpleFlowchart;
    case 'payment':
      return paymentFlowchart;
    default:
      return checkoutFlowchart;
  }
};

export type FlowchartType = 'checkout' | 'simple' | 'payment';

export interface FlowchartOption {
  label: string;
  value: FlowchartType;
}

export const flowchartOptions: FlowchartOption[] = [
  { label: '支付流程图', value: 'checkout' },
  { label: '简单流程图', value: 'simple' },
  { label: '支付时序图', value: 'payment' },
]; 