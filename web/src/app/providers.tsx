"use client";

import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@/lib/tanstack-query";
import { ThemeProvider } from "next-themes";

interface ProvidersProps {
	children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			enableSystem={false}
			disableTransitionOnChange={true}
		>
			<QueryClientProvider>
				{children}
				<Toaster richColors />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
