import { redirect } from "next/navigation";
import fetchLocalSession from "../../api/fetchLocalSession";
import { PaymentOrderDebug } from "../../api/generated/payment_order";
import { use } from "react";

export default function PaymentPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = new URLSearchParams();
  const searchParams = use(props.searchParams);
  const amount =
    typeof searchParams.amount === "string" ? searchParams.amount : "100";
  const currency =
    typeof searchParams.currency === "string" ? searchParams.currency : "USD";
  params.set("amount", amount);
  params.set("currency", currency);

  let redirectionUrl: string | undefined;

  try {
    const res = use(fetchLocalSession(params as unknown as PaymentOrderDebug));
    redirectionUrl = res.data?.checkOutUrl?.replace(/^https?:\/\/[^\/]+/, "");
    console.log(
      `Payment URL: ${redirectionUrl ? "✅" : "❌"} ${redirectionUrl}`,
    );

    if (!redirectionUrl) {
      return (
        <main className="flex items-center justify-center h-screen text-xl text-destructive">
          Failed to create pre-payment order
        </main>
      );
    }
  } catch (error) {
    console.error("Error creating pre-payment order:", error);
    return (
      <main className="flex items-center justify-center h-screen text-xl text-destructive">
        Failed to create pre-payment order
      </main>
    );
  }

  // 在 try/catch 外部进行重定向，避免错误被捕获
  redirect("/checkout" + redirectionUrl);
}
