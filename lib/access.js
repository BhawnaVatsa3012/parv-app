// What is free and what is paid. Pure functions, no I/O, so they are easy to test.
// The server pages and API routes call these with the result of the entitlement check.
import { effectiveLayers } from "@/lib/layers";

// Story text is free for exactly these festivals. Every other festival's story is paid.
// A festival's DATE is free for everyone, always (see lib/occurrence.js, the Calendar).
export const FREE_STORY_IDS = ["diwali", "eid", "christmas", "vaisakhi", "mahavir", "buddha", "bihu"];

export const isFreeStory = (id) => typeof id === "string" && FREE_STORY_IDS.includes(id);

// Entitlement is "an active subscriptions row". on_hold, cancelled, expired,
// no row and signed-out are all NOT entitled. (Checkout still refuses to start a
// second subscription for an on_hold user; that is a different question.)
export const isPaidStatus = (status) => status === "active";

// Can this reader see the whole story? `entitled` is the boolean from isEntitledToRituals().
export const canReadStory = (id, entitled) => entitled === true || isFreeStory(id);

// Calendar layers (Hindu Panchang, Hijri details, tithi, timings, Lunar details), Rituals and Prepare are paid.
export const canUseLayers = (entitled) => entitled === true;
export const canUseRituals = (entitled) => entitled === true;
export const canUsePrepare = (entitled) => entitled === true;

// The layers to actually compute and show: the saved choice for members, none otherwise.
export const layersForReader = (entitled, saved) => (canUseLayers(entitled) ? effectiveLayers(saved) : []);

// The story as it may be sent to the browser. `regions` must already be in display order.
// Paid readers (and anyone on a free festival) get everything. Others get:
//   - the first region in full, as a preview,
//   - the other regions as name + date only (text withheld),
//   - ritual count, first ritual's heading and "when" only (no samagri, steps, mantra, attire).
// Returns null for an unknown festival.
export function gateStory(id, data, regions, entitled) {
  if (!data) return null;
  const open = canReadStory(id, entitled);
  const ritualsOpen = canUseRituals(entitled);
  const rituals = data.rituals || [];
  return {
    title: data.title,
    sky: data.sky,
    dateNote: data.dateNote,
    storyOpen: open,
    regions: regions.map((r, i) =>
      open || i === 0
        ? { ...r, preview: !open && i === 0 }
        : { name: r.name, date: r.date, mine: r.mine, locked: true }
    ),
    ritualsOpen,
    ritualCount: rituals.length,
    ritualHeading: rituals[0]?.heading || "",
    ritualWhen: rituals[0]?.when || "",
    rituals: ritualsOpen ? rituals : [],
  };
}
