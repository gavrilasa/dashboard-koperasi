// path: app/dashboard/layout.tsx

import type { Metadata } from "next";
import AuthenticatedLayout from "@/components/layout/authenticated-layout";
import { Header } from "@/components/layout/header"; // 1. Impor komponen Header
import { Main } from "@/components/layout/main"; // 2. Impor komponen Main

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
		// AuthenticatedLayout akan menyediakan Sidebar
		<AuthenticatedLayout>
			{/* Di dalam area konten utama yang disediakan oleh AuthenticatedLayout,
        kita tempatkan Header dan Main content.
      */}
			<Header />
			<Main>{children}</Main>
		</AuthenticatedLayout>
	);
}
