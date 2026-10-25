import { headers } from "next/headers";
import { getUser } from "@/lib/session";
import { isEntitledToRituals } from "@/lib/entitlements";
import PricingClient from "./PricingClient";

export const dynamic = "force-dynamic";

export default async function PricingPage({ searchParams }) {
  const country = headers().get("x-vercel-ip-country") || "";
  const detectedRegion = country === "IN" || !country ? "india" : "international";
  const user = await getUser();
  const member = await isEntitledToRituals();
  const clean = (v) => (typeof v === "string" && /^[A-Za-z0-9_-]{1,60}$/.test(v) ? v : "");

  return (
    <PricingClient
      detectedRegion={detectedRegion}
      email={user?.email || ""}
      member={member}
      success={searchParams?.status === "success"}
      paymentId={clean(searchParams?.pid)}
      via={clean(searchParams?.via)}
      from={clean(searchParams?.from)}
    />
  );
}
