import "./globals.css";
import "./classical.css";
import { LangProvider } from "@/components/ui/Lang";

export const metadata = {
  title: "Parv — the stories behind our festivals",
  description: "Regional stories and rituals for Indian festivals, starting with Hindu festivals.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f2f2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
