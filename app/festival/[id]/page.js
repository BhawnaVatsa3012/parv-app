import { headers } from "next/headers";
import { isEntitledToRituals } from "@/lib/entitlements";
import FestivalPageClient from "./FestivalPageClient";

export default async function FestivalPage({ params }) {
  const entitled = await isEntitledToRituals();
  const price = headers().get("x-vercel-ip-country") === "IN" || !headers().get("x-vercel-ip-country") ? "₹99" : "$3.99";
  return <FestivalPageClient params={params} entitled={entitled} price={price} />;
}
