import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "../styles/globals.css";
import { AppSidebar } from "./(app)/_components/app-sidebar";
import { Header } from "./(app)/_components/header";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Gesture Pro",
    default: "Gesture Pro",
  },
  description: "Gesture Pro is a platform for creating and sharing gestures.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />

            <SidebarInset className="p-10 pt-2 space-y-7">
              <Header />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
