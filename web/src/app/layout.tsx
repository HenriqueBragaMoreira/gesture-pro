import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "../styles/globals.css";
import { AppSidebar } from "./(app)/_components/app-sidebar";
import { Header } from "./(app)/_components/header";

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
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SidebarProvider defaultOpen={defaultOpen}>
					<AppSidebar />

					<SidebarInset className="px-10">
						<Header />
						{children}
					</SidebarInset>
				</SidebarProvider>
			</body>
		</html>
	);
}
