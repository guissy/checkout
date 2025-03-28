import { ReferenceInputSchema } from "@/schemas";
import { errorResponse } from "@/lib/api/response";
import {
  getPaymentServiceManager,
  PaymentEventData,
} from "@/machines/payService";
import { PaymentStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // 解析请求 URL 中的查询参数
    const url = new URL(request.url);
    const referenceInput = ReferenceInputSchema.safeParse({
      reference: url.searchParams.get("reference"),
    });

    if (!referenceInput.success) {
      return errorResponse("无效的引用编号", 400, referenceInput.error);
    }

    const { reference } = referenceInput.data;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // 创建一个 TransformStream 以便进行 Server-Sent Events
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // 发送初始状态
    writer.write(
      encoder.encode(`data: ${JSON.stringify(PaymentStatus.PENDING)}\n\n`),
    );

    // 启动异步处理状态更新
    (async () => {
      try {
        while (true) {
          // 使用 Promise.race 等待状态更改或超时
          const newData = await Promise.race<PaymentEventData | null>([
            new Promise((resolve) =>
              getPaymentServiceManager().once("stateChange", (newData) => {
                if (reference && reference === newData.orderId) {
                  return resolve(newData as PaymentEventData);
                }
              }),
            ),
            delay(5000).then(() => null),
          ]);

          // 发送更新或保持当前状态
          writer.write(
            encoder.encode(
              `data: ${JSON.stringify(newData?.currentState ?? PaymentStatus.PENDING)}\n\n`,
            ),
          );
        }
      } catch (error) {
        // 处理错误
        writer.write(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ error: (error as Error).message })}\n\n`,
          ),
        );
      } finally {
        writer.close();
      }
    })();

    // 设置响应头
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("SSE Error:", error);
    return errorResponse((error as Error)?.message || "流处理时发生错误", 500);
  }
}
