import Screen from "@/components/ui/Screen";
import MapClient from "./MapClient";

export const metadata = { title: "Map — Parv" };

export default function MapPage() {
  return (
    <Screen nav background="var(--color-bg)">
      <MapClient />
    </Screen>
  );
}
