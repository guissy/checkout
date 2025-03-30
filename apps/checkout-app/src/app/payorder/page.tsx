import { LoadingPage } from "checkout-ui";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";

type SearchParams = Promise<{ reference: string }>;

// 创建内容组件来处理异步逻辑
async function HomeContent(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  redirect(`/alipayPlus/?reference=${searchParams.reference}`);
  return null; // 这行代码不会执行，因为 redirect 会阻止渲染
}

export default function Home(props: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <HomeContent searchParams={props.searchParams} />
    </Suspense>
  );
}
