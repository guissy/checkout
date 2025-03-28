import { redirect } from "next/navigation";
import { use } from "react";

type SearchParams = Promise<{ reference: string }>;
export default function Home(props: { searchParams: SearchParams }) {
  const searchParams = use(props.searchParams);
  redirect(`/alipayPlus/?reference=${searchParams.reference}`);
}
