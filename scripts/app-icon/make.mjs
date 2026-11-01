// Draws Parv's app icon (rangoli flower on the splash colours) and writes the PNG sizes.
// Run: npm i --no-save @resvg/resvg-js && node scripts/app-icon/make.mjs, then copy icon-192/512 to public/, apple-icon.png and icon.png to app/.
import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
// Parv icon: the app's rangoli flower on the splash-screen colours.
// The flower stays within the central 72% so Android's round and squircle
// masks never clip it ("maskable").
const P = ["#d37900", "#d863a0", "#33ac5a", "#009ce9", "#e2684a", "#a278e4"];
const L = ["#ffcc98", "#ffc0e0", "#ade9b8", "#a0e0ff", "#ffc3b0", "#e0cbff"];
let petals = "";
for (let i = 0; i < 8; i++) petals += `<ellipse cx="70" cy="34" rx="11" ry="26" transform="rotate(${i * 45} 70 70)" fill="${L[i % 6]}" fill-opacity="0.92" stroke="#fff7e8" stroke-width="1.6"/>`;
for (let i = 0; i < 8; i++) petals += `<ellipse cx="70" cy="49" rx="5" ry="12" transform="rotate(${i * 45 + 22.5} 70 70)" fill="none" stroke="${P[(i + 3) % 6]}" stroke-width="1.6"/>`;
for (let i = 0; i < 16; i++) petals += `<circle cx="70" cy="3.5" r="2.2" transform="rotate(${i * 22.5} 70 70)" fill="#fff3d6"/>`;
const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#f09c17"/><stop offset="0.55" stop-color="#dd4115"/><stop offset="1" stop-color="#831826"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.44" r="0.5"><stop offset="0" stop-color="#fac053" stop-opacity="0.9"/><stop offset="1" stop-color="#fac053" stop-opacity="0"/></radialGradient>
    <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.6" fill="#fff" fill-opacity="0.16"/></pattern>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <rect width="512" height="512" fill="url(#dots)"/>
  <circle cx="256" cy="246" r="230" fill="url(#glow)"/>
  <g transform="translate(256 256) scale(2.55) translate(-70 -70)">
    ${petals}
    <circle cx="70" cy="70" r="62" fill="none" stroke="#fff7e8" stroke-width="1" stroke-dasharray="2 4"/>
    <circle cx="70" cy="70" r="9" fill="#fff3d6" stroke="#831826" stroke-width="1.4"/>
  </g>
</svg>`;
for (const [name, size] of [["icon-512.png", 512], ["icon-192.png", 192], ["apple-icon.png", 180], ["icon.png", 48]]) {
  fs.writeFileSync(name, new Resvg(svg(size), { fitTo: { mode: "width", value: size } }).render().asPng());
}
fs.writeFileSync("icon.svg", svg(512));
console.log("ok");
