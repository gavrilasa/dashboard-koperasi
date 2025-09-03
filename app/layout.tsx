import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Impor font Inter
import "./globals.css";
import AuthenticatedLayout from "@/components/layout/authenticated-layout";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "Finance Koperasi",
	description: "Aplikasi Keuangan Koperasi",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} antialiased`}>
				<AuthenticatedLayout>
					<Header />
					<Main>{children}</Main>
				</AuthenticatedLayout>
			</body>
		</html>
	);
}
