// path: app/dashboard/layout.tsx

import Header from "@/components/layout/header";
import Sidebar from "@/app/components/layout/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Dasbor Koperasi",
	description: "Aplikasi Manajemen Koperasi",
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Header />
			<div className="flex h-screen overflow-hidden">
				<Sidebar />
				<main className="w-full pt-16">{children}</main>
			</div>
		</>
	);
}
