import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");
const pages = { terms: read("app/terms/page.js"), privacy: read("app/privacy/page.js"), refund: read("app/refund/page.js") };
const lp = read("components/LegalPage.js");

describe("legal pages", () => {
  it("share one set of operator and contact details", () => {
    expect(lp).toMatch(/operator: "Bhawna Mishra"/);
    expect(lp).toMatch(/operatorDesc: "Bhawna Mishra, an individual/);
    expect(lp).toMatch(/grievanceOfficer: "Bhawna Mishra"/);
    expect(lp).toMatch(/email: "vatsa\.bhawna@gmail\.com"/);
    expect(lp).toMatch(/Adarsh Dairy Road, Malad West, Mumbai, Maharashtra 400064/);
    expect(lp).toMatch(/ackTime: "24 hours"/);
    expect(lp).toMatch(/resolveTime: "7 days"/);
    for (const [name, src] of Object.entries(pages)) expect(src, name).toMatch(/LEGAL\.email/);
    expect(pages.terms).toMatch(/Courts at \{LEGAL\.court\}/);
  });
  it("only the unverifiable income-tax retention item is still marked TO CONFIRM", () => {
    const marks = Object.entries(pages).flatMap(([n, s]) => (s.match(/<TC>[^<]*<\/TC>/g) || []).map((m) => `${n}: ${m}`));
    expect(marks).toHaveLength(1);
    expect(marks[0]).toMatch(/privacy: .*Income-tax Act, 2025/);
  });
  it("states the refund rule without hard-coded prices", () => {
    expect(pages.refund).toMatch(/Monthly plan: no refund for the current billing month/);
    expect(pages.refund).toMatch(/within 7 days of the first purchase or of a renewal/);
    expect(pages.refund).toMatch(/no pro-rata refunds/);
    expect(pages.refund).toMatch(/5 to 7 working days/);
    expect(pages.refund).toMatch(/refund the unused part of any period already paid/);
    for (const s of Object.values(pages)) expect(s).not.toMatch(/₹|Rs\.? ?\d|\b399\b|\b49\b/);
  });
  it("describes Anthropic terms with a source link and the Supabase region", () => {
    expect(pages.privacy).toMatch(/privacy\.claude\.com\/en\/articles\/7996866/);
    expect(pages.privacy).toMatch(/does not use the inputs or outputs to train/);
    expect(pages.privacy).toMatch(/within 30 days of receipt or generation/);
    expect(pages.privacy).toMatch(/Mumbai, India \(AWS ap-south-1/);
  });
});
