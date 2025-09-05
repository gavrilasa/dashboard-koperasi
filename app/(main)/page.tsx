import { Suspense } from "react";
import { endOfDay, startOfDay } from "date-fns";
import {
	getDashboardStats,
	getTransactionChartData,
	getMainAccountChartData,
} from "@/features/dashboard/data";
import { DashboardClient } from "@/features/dashboard/components/DashboardClient";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";

/**
 * Komponen data fetcher yang berjalan di server.
 * Mengambil semua data yang diperlukan dan meneruskannya ke komponen klien.
 */
async function DashboardContent({
	dateRange,
}: {
	dateRange: { from: Date; to: Date };
}) {
	// Mengambil semua data untuk dashboard secara paralel
	const [stats, transactionChartData, mainAccountChartData] = await Promise.all(
		[
			getDashboardStats(dateRange),
			getTransactionChartData(dateRange),
			getMainAccountChartData(dateRange),
		]
	);

	// Me-render komponen klien dengan data yang sudah siap
	return (
		<DashboardClient
			stats={stats}
			transactionChartData={transactionChartData}
			mainAccountChartData={mainAccountChartData}
		/>
	);
}

/**
 * Halaman utama Dashboard.
 * Merupakan Server Component yang mengatur pengambilan data dan menampilkan
 * skeleton loader menggunakan Suspense saat data sedang dimuat atau saat
 * filter tanggal diubah di sisi klien.
 */
export default function HomePage({
	searchParams,
}: {
	searchParams?: {
		from?: string;
		to?: string;
	};
}) {
	// FIX: Pastikan rentang waktu mencakup seluruh hari
	const from = searchParams?.from
		? startOfDay(new Date(searchParams.from)) // Gunakan awal hari dari tanggal 'from'
		: startOfDay(new Date()); // Default ke awal hari ini

	const to = searchParams?.to
		? endOfDay(new Date(searchParams.to)) // Gunakan akhir hari dari tanggal 'to'
		: endOfDay(new Date()); // Default ke akhir hari ini

	// Kunci unik untuk Suspense. Saat searchParams berubah, kunci ini berubah,
	// yang akan memicu Suspense untuk menampilkan fallback (skeleton)
	// dan me-render ulang komponen DashboardContent dengan data baru.
	const suspenseKey = `${from.toISOString()}-${to.toISOString()}`;

	return (
		<Suspense key={suspenseKey} fallback={<DashboardSkeleton />}>
			<DashboardContent dateRange={{ from, to }} />
		</Suspense>
	);
}
