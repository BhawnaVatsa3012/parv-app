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
- Pongal: the Tamil month Thai begins on the Makar Sankranti day (Drik rule, same as Puthandu: before sunset
  that day, else the next day); Bhogi is the day before, Mattu Pongal and Kaanum Pongal the 1st and 2nd day
  after. Thai Pongal 2026–2030 is 14 Jan 2026, 15 Jan 2027, 15 Jan 2028, 14 Jan 2029, 14 Jan 2030: matches
  Temples in India Info (all five, with the Sankranti moments), Drik Panchang (New Delhi; 2030), Free Press
  Journal (2026 dates for all four days), publicholidays.in (2027, 2028) and officeholidays (2027).
  2026 is disputed: publicholidays.in and officeholidays show the Tamil Nadu holiday on 15 Jan 2026, and the
  Sri Lankan report (Newsonair) calls 15 Jan the main day, because Makar Sankranti was at 3:13 pm on 14 Jan
  by Drik and a Tamil Vakya panchangam can place it after sunset. Not overridden; 2026 has passed.
- Onam: Thiruvonam is the day the Moon is in Shravana (nakshatra 22, Lahiri) at midday (Madhyahna), for a
  Kochi observer, while the sidereal Sun is in Simha (Chingam, 120 to 150 degrees). Uthradom is the day before,
  Avittam and Chathayam the 1st and 2nd day after. Atham is the Hasta (13) sunrise day 8 to 11 days earlier;
  if Hasta is skipped at sunrise, the day before the first Chitra sunrise. That makes the first of the ten days
  nakshatra-based, so the span runs 9 to 11 days in some years. Thiruvonam 2026–2030 matches qppstudio (all
  five), Drik Panchang (New Delhi page: 26 Aug 2026 and 22 Aug 2029), officeholidays (2026, 2027),
  publicholidays.in (2027, 2028; its 2026 row shows 27 Aug, which disagrees with all the others), and
  Daanyam/Drik Thiruvananthapuram for 2026. The 2026 Atham (16 Aug) and Uthradam (25 Aug) match Drik. 2027
  Thiruvonam nakshatra begins 2:58 am 12 Sep (Temples in India Info). Atham for 2027–2030 is computed only.
- Karva Chauth: Krishna Chaturthi of amanta Ashwin (purnimanta Kartik), on the day Chaturthi is present at
  Delhi moonrise (the first such night if two). Matches Temples in India Info (undated city) for 2026 (29 Oct),
  2027 (18 Oct), 2028 (7 Oct), 2029 (26 Oct), 2030 (15 Oct); 2026 also Free Press Journal (citing Drik). 2027 is
  disputed: Chaturthi begins 5:50 pm on 18 Oct and ends 6:41 pm on 19 Oct, so the moon rises under it only on
  the 18th (our rule, Temples in India Info). vedpanchang (Delhi, Agra) and Daanyam (Bengaluru) show 19 Oct,
  the day Chaturthi holds at sunrise. Not overridden.
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
- Vaisakhi (Sikh, solar): the civil date (IST, Delhi) on which the Sun enters sidereal Mesha (Mesha Sankranti,
  the same moment used for Baisakhi in the New Year cluster). Result 2026–2030: 14 Apr 2026, 14 Apr 2027, 13 Apr
  2028, 14 Apr 2029, 14 Apr 2030. The Mesha Sankranti moment for 2026 is 9:38 am IST on 14 April (9:39 am by
  Drik Panchang, as quoted by Asianet Newsable); 2025 3:30 am on 14 April (IndiaTV citing Drik).
  Dates match Temples in India Info (all five years), publicholidays.in (2026–28), officeholidays (2026, 2027) and
  PTC News (14 April 2026, Khalsa Sajna Diwas). 2029 has only Temples in India Info and our own calculation for
  India (muhuratam's New York page also says 14 April; the Kathmandu panchang puts Mesha Sankranti on 14 April).
  A disagreement to watch: in 2025 the sankranti fell at 3:30 am on 14 April, yet the Punjab holiday and the Golden
  Temple celebrations were on 13 April (officeholidays Punjab, IANS 13 Apr 2025); the same pattern (a sankranti
  just after midnight) is repeated in 2029 (3:56 am, 14 April), so Punjab may well keep 13 April 2029. The page
  says the day is announced by Sikh bodies and shows a note. Not overridden.
- Mahavir Jayanti (Jain): Chaitra Shukla Trayodashi (amanta Chaitra, tithi 13) on the day it holds at sunrise in Delhi
  (udaya tithi). Result 2026–2030: 31 Mar 2026, 19 Apr 2027, 7 Apr 2028, 26 Apr 2029, 16 Apr 2030, matching
  qppstudio (all five years), publicholidays.in (2026–28), bhaktibharat (2026–28 where listed), Drik Panchang for New
  Delhi (2027: Trayodashi 7:42 am 18 Apr to 6:08 am 19 Apr) and, for 2026, Free Press Journal and Asianet
  Newsable (Trayodashi 7:09 am 30 Mar to 6:55 am 31 Mar, 'official Jain calendar' 31 Mar). One disagreement:
  officeholidays.com lists Sunday 18 April 2027, while Trayodashi holds at sunrise on 19 April by only about 17
  minutes (it is the tithi for most of the 18th daytime). Not overridden; the page tells readers to confirm with their
  sangh. Some 2026 articles asked '30 or 31 March' because the tithi began at 7:09 am on the 30th; 31 March is right
  by the sunrise rule.
- Buddha Purnima (Buddhist): Vaishakha Purnima (amanta Vaishakha, tithi 15) on the day Purnima holds at sunrise in
  Delhi. Result 2026–2030: 1 May 2026, 20 May 2027, 8 May 2028, 27 May 2029, 17 May 2030. Matches Temples in India Info
  (all five years, with tithi times within a minute or two of ours), publicholidays.in (2026–28), Dekho Panchang
  (Delhi: 2029, 2030, 'udaya tithi'), and Nagpur press for 1 May 2026. Disagreement to note, not a date change: Saga
  Dawa Düchen (Ladakh, Sikkim, Tibetan communities) follows the Tibetan fourth month; one guide (StayVista) gives 31 May
  2026 for it, and wrongly says that is also Buddha Purnima (1 May 2026 in every Indian calendar checked). Sri Lanka and
  South-East Asia keep Vesak by their own rules. The page says so.
- Christmas (Christian): fixed civil date, 25 December every year, with Christmas Eve (Midnight Mass) on 24 December;
  no lunar rule, so no source disagreement for the date. Churches that follow the Julian calendar (some Orthodox
  churches) keep 7 January; the app's note says to check with your own church.
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
