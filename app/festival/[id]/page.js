import { isEntitledToRituals } from "@/lib/entitlements";
import FestivalPageClient from "./FestivalPageClient";

export default async function FestivalPage({ params }) {
  const entitled = await isEntitledToRituals();
  return <FestivalPageClient params={params} entitled={entitled} />;
}
