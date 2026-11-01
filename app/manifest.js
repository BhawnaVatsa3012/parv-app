// Lets phones install Parv from the browser ("Add to Home screen" /
// "Install app"): its name, icon, and full-screen opening.
export default function manifest() {
  return {
    name: "Parv — the stories behind our festivals",
    short_name: "Parv",
    description: "Regional stories, rituals and the daily panchang for Indian festivals.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f3f2f2",
    theme_color: "#f3f2f2",
    lang: "en-IN",
    categories: ["lifestyle", "education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
