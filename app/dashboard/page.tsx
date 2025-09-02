import { Main } from "@/components/layout/main"; // Impor komponennya

export default function DashboardPage() {
	return (
		// Gunakan <Main /> untuk membungkus konten halaman
		<Main>
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">
					Selamat Datang di Dasbor 👋
				</h2>
			</div>
			<p>Ini adalah halaman utama dasbor Anda.</p>
		</Main>
	);
}
