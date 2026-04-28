import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PetCare — All-in-One Pet Care Platform",
  description: "Shop, book vets, and learn everything about pet care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
          <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "PetCare", "version": "1.0.0"}'
          />
          {children}
          <Toaster richColors position="top-right" />
          <VisualEditsMessenger />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
