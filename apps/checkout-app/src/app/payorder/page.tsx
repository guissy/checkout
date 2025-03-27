import { redirect } from "next/navigation";

type SearchParams = Promise<{ reference: string }>;
export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  redirect(`/alipayPlus/?reference=${searchParams.reference}`);
}
