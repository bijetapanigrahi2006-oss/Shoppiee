import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { DISPLAY_COOKIE, parseDisplay } from "@/lib/display";
import { PressEffects } from "@/components/ui/effects";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Shoppiee — the app that shops with you",
  description: "Compare prices across Amazon, Flipkart, Myntra, Nykaa and more. Price history, fake-discount detection, AI recommendations and screenshot search.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Resolves "system" theme before paint so there is no flash.
const themeScript = `(function(){try{var d=document.documentElement;if(d.dataset.pref==='system'){var m=window.matchMedia('(prefers-color-scheme: dark)');d.dataset.theme=m.matches?'dark':'light';m.addEventListener('change',function(e){if(d.dataset.pref==='system')d.dataset.theme=e.matches?'dark':'light'})}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const prefs = parseDisplay((await cookies()).get(DISPLAY_COOKIE)?.value);
  return (
    <html
      lang="en"
      data-pref={prefs.theme}
      data-theme={prefs.theme === "system" ? "dark" : prefs.theme}
      data-density={prefs.density}
      data-fontsize={prefs.fontSize}
      data-motion={prefs.motion}
      style={{ ["--accent" as string]: prefs.accent }}
      className={`${jakarta.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        {children}
        <PressEffects />
      </body>
    </html>
  );
}
