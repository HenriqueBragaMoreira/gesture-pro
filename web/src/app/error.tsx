"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorPage({ error }: ErrorPageProps) {
	return (
		<div className="flex min-h-[80vh] items-center justify-center p-6">
			<Card className="mx-auto max-w-md shadow-lg">
				<CardHeader className="space-y-1 text-center">
					<div className="flex justify-center">
						<AlertCircle className="h-12 w-12 text-red-500" />
					</div>
					<CardTitle className="text-2xl">Ops! Algo deu errado</CardTitle>
					<CardDescription>
						Encontramos um problema ao processar sua solicitação.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-200">
						{error.message ||
							"Ocorreu um erro inesperado. Por favor, tente novamente."}
						{error.digest && (
							<div className="mt-2 text-xs text-red-400 dark:text-red-300">
								Código de referência: {error.digest}
							</div>
						)}
					</div>
					<div className="text-sm text-muted-foreground">
						<p>
							Se o problema persistir, entre em contato com o suporte técnico e
							informe o código de referência acima.
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
					<Button variant="outline" className="w-full sm:w-auto" asChild>
						<Link href="/">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Voltar ao Dashboard
						</Link>
					</Button>
					<Button
						className="w-full sm:w-auto"
						onClick={() => window.location.reload()}
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Tentar Novamente
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
