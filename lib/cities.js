// Cities a user can pick as "my city". Times in the app are calculated
// from these coordinates. The server only ever saves coordinates from
// this list, never ones sent by the browser.
const IN = "Asia/Kolkata";
const C = (id, name, state, country, lat, lon, tz = IN) => ({ id, name, state, country, lat, lon, tz });

export const CITIES = [
  // India
  C("mumbai", "Mumbai", "Maharashtra", "India", 19.08, 72.88),
  C("pune", "Pune", "Maharashtra", "India", 18.52, 73.86),
  C("nagpur", "Nagpur", "Maharashtra", "India", 21.15, 79.09),
  C("nashik", "Nashik", "Maharashtra", "India", 20.0, 73.79),
  C("delhi", "Delhi", "Delhi", "India", 28.61, 77.21),
  C("noida", "Noida", "Uttar Pradesh", "India", 28.54, 77.39),
  C("gurugram", "Gurugram", "Haryana", "India", 28.46, 77.03),
  C("chandigarh", "Chandigarh", "Chandigarh", "India", 30.73, 76.78),
  C("amritsar", "Amritsar", "Punjab", "India", 31.63, 74.87),
  C("ludhiana", "Ludhiana", "Punjab", "India", 30.9, 75.85),
  C("jaipur", "Jaipur", "Rajasthan", "India", 26.91, 75.79),
  C("jodhpur", "Jodhpur", "Rajasthan", "India", 26.24, 73.02),
  C("udaipur", "Udaipur", "Rajasthan", "India", 24.59, 73.71),
  C("ahmedabad", "Ahmedabad", "Gujarat", "India", 23.02, 72.57),
  C("surat", "Surat", "Gujarat", "India", 21.17, 72.83),
  C("vadodara", "Vadodara", "Gujarat", "India", 22.31, 73.18),
  C("lucknow", "Lucknow", "Uttar Pradesh", "India", 26.85, 80.95),
  C("kanpur", "Kanpur", "Uttar Pradesh", "India", 26.45, 80.33),
  C("varanasi", "Varanasi", "Uttar Pradesh", "India", 25.32, 82.97),
  C("prayagraj", "Prayagraj", "Uttar Pradesh", "India", 25.44, 81.85),
  C("agra", "Agra", "Uttar Pradesh", "India", 27.18, 78.01),
  C("mathura", "Mathura", "Uttar Pradesh", "India", 27.49, 77.67),
  C("ayodhya", "Ayodhya", "Uttar Pradesh", "India", 26.8, 82.2),
  C("patna", "Patna", "Bihar", "India", 25.59, 85.14),
  C("gaya", "Gaya", "Bihar", "India", 24.79, 85.0),
  C("ranchi", "Ranchi", "Jharkhand", "India", 23.34, 85.31),
  C("bokaro", "Bokaro Steel City", "Jharkhand", "India", 23.67, 86.15),
  C("jamshedpur", "Jamshedpur", "Jharkhand", "India", 22.8, 86.2),
  C("kolkata", "Kolkata", "West Bengal", "India", 22.57, 88.36),
  C("siliguri", "Siliguri", "West Bengal", "India", 26.73, 88.4),
  C("bhubaneswar", "Bhubaneswar", "Odisha", "India", 20.3, 85.82),
  C("puri", "Puri", "Odisha", "India", 19.81, 85.83),
  C("guwahati", "Guwahati", "Assam", "India", 26.14, 91.74),
  C("imphal", "Imphal", "Manipur", "India", 24.82, 93.94),
  C("shillong", "Shillong", "Meghalaya", "India", 25.58, 91.89),
  C("bhopal", "Bhopal", "Madhya Pradesh", "India", 23.26, 77.41),
  C("indore", "Indore", "Madhya Pradesh", "India", 22.72, 75.86),
  C("raipur", "Raipur", "Chhattisgarh", "India", 21.25, 81.63),
  C("dehradun", "Dehradun", "Uttarakhand", "India", 30.32, 78.03),
  C("shimla", "Shimla", "Himachal Pradesh", "India", 31.1, 77.17),
  C("jammu", "Jammu", "Jammu & Kashmir", "India", 32.73, 74.86),
  C("srinagar", "Srinagar", "Jammu & Kashmir", "India", 34.08, 74.8),
  C("hyderabad", "Hyderabad", "Telangana", "India", 17.39, 78.49),
  C("vijayawada", "Vijayawada", "Andhra Pradesh", "India", 16.51, 80.65),
  C("visakhapatnam", "Visakhapatnam", "Andhra Pradesh", "India", 17.69, 83.22),
  C("bengaluru", "Bengaluru", "Karnataka", "India", 12.97, 77.59),
  C("mysuru", "Mysuru", "Karnataka", "India", 12.3, 76.64),
  C("mangaluru", "Mangaluru", "Karnataka", "India", 12.91, 74.86),
  C("chennai", "Chennai", "Tamil Nadu", "India", 13.08, 80.27),
  C("madurai", "Madurai", "Tamil Nadu", "India", 9.93, 78.12),
  C("coimbatore", "Coimbatore", "Tamil Nadu", "India", 11.02, 76.96),
  C("thiruvananthapuram", "Thiruvananthapuram", "Kerala", "India", 8.52, 76.94),
  C("kochi", "Kochi", "Kerala", "India", 9.93, 76.27),
  C("panaji", "Panaji", "Goa", "India", 15.5, 73.83),
  // Abroad
  C("london", "London", "", "United Kingdom", 51.51, -0.13, "Europe/London"),
  C("leicester", "Leicester", "", "United Kingdom", 52.64, -1.13, "Europe/London"),
  C("newyork", "New York", "", "United States", 40.71, -74.01, "America/New_York"),
  C("edison", "Edison, New Jersey", "", "United States", 40.52, -74.41, "America/New_York"),
  C("chicago", "Chicago", "", "United States", 41.88, -87.63, "America/Chicago"),
  C("houston", "Houston", "", "United States", 29.76, -95.37, "America/Chicago"),
  C("sanjose", "San Jose (Bay Area)", "", "United States", 37.34, -121.89, "America/Los_Angeles"),
  C("toronto", "Toronto", "", "Canada", 43.65, -79.38, "America/Toronto"),
  C("vancouver", "Vancouver", "", "Canada", 49.28, -123.12, "America/Vancouver"),
  C("dubai", "Dubai", "", "United Arab Emirates", 25.2, 55.27, "Asia/Dubai"),
  C("singapore", "Singapore", "", "Singapore", 1.35, 103.82, "Asia/Singapore"),
  C("kualalumpur", "Kuala Lumpur", "", "Malaysia", 3.14, 101.69, "Asia/Kuala_Lumpur"),
  C("kathmandu", "Kathmandu", "", "Nepal", 27.72, 85.32, "Asia/Kathmandu"),
  C("sydney", "Sydney", "", "Australia", -33.87, 151.21, "Australia/Sydney"),
  C("melbourne", "Melbourne", "", "Australia", -37.81, 144.96, "Australia/Melbourne"),
  C("auckland", "Auckland", "", "New Zealand", -36.85, 174.76, "Pacific/Auckland"),
  C("portlouis", "Port Louis", "", "Mauritius", -20.16, 57.5, "Indian/Mauritius"),
  C("durban", "Durban", "", "South Africa", -29.86, 31.02, "Africa/Johannesburg"),
  C("portofspain", "Port of Spain", "", "Trinidad and Tobago", 10.65, -61.51, "America/Port_of_Spain"),
  C("suva", "Suva", "", "Fiji", -18.14, 178.44, "Pacific/Fiji"),
];

export const cityById = (id) => CITIES.find((c) => c.id === id) || null;
export const DEFAULT_CITY = cityById("delhi");
export const cityLabel = (c) => (c ? (c.state ? `${c.name}, ${c.state}` : `${c.name}, ${c.country}`) : "");

// Closest city in the list to a point (for "use my location").
export function nearestCity(lat, lon) {
  const rad = Math.PI / 180;
  let best = null, bestKm = Infinity;
  for (const c of CITIES) {
    const dLat = (c.lat - lat) * rad, dLon = (c.lon - lon) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * rad) * Math.cos(c.lat * rad) * Math.sin(dLon / 2) ** 2;
    const km = 12742 * Math.asin(Math.sqrt(a));
    if (km < bestKm) { bestKm = km; best = c; }
  }
  return { city: best, km: Math.round(bestKm) };
}
