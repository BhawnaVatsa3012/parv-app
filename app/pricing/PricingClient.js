"use client";
import { useState } from "react";
import RazorpaySubscribeButton from "@/components/RazorpaySubscribeButton";
import DodoSubscribeButton from "@/components/DodoSubscribeButton";

// PROPOSED pricing — pending your approval, see chat for the reasoning.
// Change these two lines once you've decided; nothing else needs to change.
const INDIA_PRICE = "₹99/month";
const INTL_PRICE = "$3.99/month";

export default function PricingClient({ detectedRegion }) {
  const [region, setRegion] = useState(detectedRegion);

  return (
    <main className="min-h-[100dvh] bg-night text-cream flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-1">Unlock Rituals</h1>
        <p className="text-[13px] text-muted mb-5">
          Stories stay free, always. Rituals — the samagri, steps and mantras
          for every festival — are part of Parv's subscription.
        </p>

        <div className="flex gap-1.5 mb-4">
          <button
            onClick={() => setRegion("india")}
            className={`flex-1 text-center py-2 rounded-xl text-xs font-bold border ${region === "india" ? "bg-marigold text-[#3A2405] border-marigold" : "text-muted border-white/15"}`}
          >
            India
          </button>
          <button
            onClick={() => setRegion("international")}
            className={`flex-1 text-center py-2 rounded-xl text-xs font-bold border ${region === "international" ? "bg-marigold text-[#3A2405] border-marigold" : "text-muted border-white/15"}`}
          >
            International
          </button>
        </div>

        <div className="bg-night2 rounded-2xl p-5 mb-4 text-center">
          <div className="text-3xl font-display mb-1">
            {region === "india" ? INDIA_PRICE : INTL_PRICE}
          </div>
          <div className="text-[11px] text-muted">Cancel anytime</div>
        </div>

        {region === "india" ? <RazorpaySubscribeButton /> : <DodoSubscribeButton />}
      </div>
    </main>
  );
}
