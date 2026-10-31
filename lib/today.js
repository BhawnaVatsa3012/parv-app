// Today's calendar date in India, as a local-midnight Date. Server code runs
// in UTC, so "today" is taken from India's clock to match the festival dates.
export function indiaToday(now = new Date()) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now).split("-").map(Number);
  return new Date(y, m - 1, d);
}
