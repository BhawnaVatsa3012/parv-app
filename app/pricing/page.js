import { headers } from "next/headers";
import PricingClient from "./PricingClient";

export default function PricingPage() {
  const countryCode = headers().get("x-vercel-ip-country") || "";
  const detectedRegion = countryCode === "IN" ? "india" : "international";

  return <PricingClient detectedRegion={detectedRegion} />;
}
