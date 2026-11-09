# Festival dates

`lib/festivalDates.js` holds every festival day in the library for 2026–2030,
computed for New Delhi (IST) by `rules.mjs` with the app's own panchang engine
(`lib/panchang.js`, astronomy-engine), and checked against published panchangs.

Regenerate (from the repo root): `node scripts/festival-dates/generate.mjs 2026 2030`

To add a year: widen the range, run it, check the new dates against at least two
published sources for India (not Drik pages without a city — they default to
Lancaster, California), and put any close calls in `OVERRIDES` with the reason.

## Rules
- Lunar months are amanta; a month with no sankranti is adhik and festivals skip
  it (Gudi Padwa 2029 is in nija Chaitra, 14 Apr).
- Sankranti uses Lahiri ayanamsa, calibrated to Drik's Makar Sankranti moments
  (14 Jan 2026 3:13 pm; 15 Jan 2028 3:26 am).
- Makar Sankranti, Pongal, Puthandu: before sunset that day, else the next day.
  Lohri, Baisakhi: the sankranti's calendar date (Lohri is the eve).
  Vishu: the first sunrise after the sankranti. Bengal and Assam: the next day.
- Holika Dahan: the first evening Purnima reaches Pradosh Kaal; Holi the day after.
- Diwali: Lakshmi Puja = Amavasya overlapping Pradosh Kaal most; Dhanteras = the
  same for Trayodashi; Naraka Chaturdashi = Chaturdashi at pre-dawn moonrise;
  Kali Puja = Amavasya at midnight; Govardhan = Pratipada at sunrise (or the
  kshaya day); Bhai Dooj = Dwitiya in Aparahna.
- Ganesh Chaturthi: Bhadrapada Shukla Chaturthi in Madhyahna (middle fifth of the day); Anant Chaturdashi
  (the last day, immersion) = Chaturdashi at sunrise. Checked 2026–2030 against Dekho Panchang (Delhi), with
  Chaturthi also in publicholidays.in (2026–28), Temples in India Info and muhuratam.in (2029) and
  Calendardate/Hindusphere (2028, 2030); Anant Chaturdashi 2026–2030 against Dekho Panchang (Delhi).
  Calendardate lists 12 Sep for 2029 (no city given); every India source with a city says 11 Sep.
- Raksha Bandhan: Purnima of amanta Shravana, tied in Aparahna and not in Bhadra (Vishti karana: the first
  half of Purnima, to the Moon's 174 degrees). If Bhadra covers all of that Aparahna, the next day provided
  Purnima holds at its sunrise (Dekho Panchang states the same rule: Aparahna avoiding Bhadra, else next day
  if Purnima is at sunrise). Checked 2026–2030 against Dekho Panchang (Delhi); also publicholidays.in
  (2026–28), Calendardate (2027, 2030), NavBharat Live (2026) and Drik Panchang for Puri (2027). 2029 (24 Aug)
  is the weakest: Purnima holds only ~87 minutes after sunrise; Dekho (Delhi, Hyderabad, Ahmedabad) say 24 Aug,
  Calendardate says 23 Aug (the first Purnima day, ignoring Bhadra).
- Maha Shivratri: Krishna Chaturdashi of amanta Magha (Phalguna in purnimanta calendars) on the day it
  overlaps Nishita Kaal most, the same rule as Janmashtami. Checked 2026–2030 against Dekho Panchang
  (Delhi) for 2026, 2027, 2029, 2030; 2028 (23 Feb) against publicholidays.in, Calendardate and timeanddate
  (Dekho's 2028 page was not retrieved). timeanddate lists all five years and agrees.
- Janmashtami: Krishna Paksha Ashtami (amanta Shravana) on the day it overlaps Nishita Kaal (8th muhurta of
  the night) most; if it touches none (2026: Ashtami ends 12:14 am), the day it holds at sunrise. The date is
  the day the vigil starts; the midnight puja is just after midnight, so sites that date by the midnight
  (Calendardate, Temples in India Info for 2027) show the next day. Dahi Handi = the next day.
  Checked 2026–2030 against Dekho Panchang (Delhi), Wikipedia (2026), muhuratam.in (2028). Some temples
  (Banke Bihari) keep the day Ashtami holds at sunrise, which can be a day later; not in the calendar.
- Chhath: Kartik Shukla Shashthi at sunrise (2023: Sandhya Arghya 19 Nov).
- Teej: Shravana / Bhadrapada Shukla Tritiya at sunrise.
- Sharad Navratri: Ghatasthapana = Ashwin Shukla Pratipada at sunrise (or the kshaya day: 30 Sep 2027);
  Ashtami at sunrise; Maha Navami at sunrise unless that is Dussehra, then with Ashtami (2024);
  Vijayadashami = Dashami in Aparahna. Durga Puja runs Shashthi to Dashami. Checked: 2024, 2025,
  2026 (Dussehra 20 Oct), 2027 (Dekho; Hindu Blog), 2028 and 2029 Ghatasthapana (Dekho Panchang).

## Checked against (Oct–Nov 2026)
Dekho Panchang (Delhi), Drik Panchang via HinduTone (India dates), AstroSage
(New Delhi), Hindupad, Hindu Blog, Temples in India Info, Vedpanchang,
Office Holidays. Every festival day 2026–2030 matched at least one India source;
differences are listed in `OVERRIDES` in `generate.mjs`.
