import "./globals.css";

export const metadata = {
  title: "Parv — the stories behind our festivals",
  description: "Regional stories and rituals for Indian festivals, starting with Hindu festivals.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body text-[#201A2E]">{children}</body>
    </html>
  );
}
