import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import {
	fetchFilteredCustomers,
	fetchCustomersPages,
} from "@/features/nasabah/data";
import { NasabahTable } from "@/features/nasabah/components/nasabah-table";
import { CreateNasabahButton } from "@/features/nasabah/components/nasabah-dialogs";
import { Search } from "@/components/shared/search";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/skeletons";

// Metadata untuk halaman (opsional, tapi baik untuk SEO)
export const metadata = {
	title: "Manajemen Nasabah",
};

/**
 * Halaman utama untuk manajemen nasabah.
 * Ini adalah Server Component yang mengambil dan menampilkan data nasabah.
 */
export default async function NasabahPage({
	searchParams,
}: {
	searchParams?: {
		query?: string;
		page?: string;
	};
}) {
	// Mencegah halaman ini di-cache secara statis karena isinya dinamis
	noStore();

	const query = searchParams?.query || "";
	const currentPage = Number(searchParams?.page) || 1;

	// Mengambil total halaman untuk paginasi
	const totalPages = await fetchCustomersPages(query);

	return (
		<div className="flex w-full flex-col">
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-bold tracking-tight">Manajemen Nasabah</h1>

				{/* Kontrol untuk pencarian dan penambahan data baru */}
				<div className="flex items-center justify-between gap-2">
					<Search placeholder="Cari nama atau no. rekening..." />
					<CreateNasabahButton />
				</div>

				{/* Suspense menangani loading state.
          Saat NasabahTableWrapper sedang mengambil data, TableSkeleton akan ditampilkan.
          'key' memastikan Suspense dievaluasi ulang setiap kali query atau page berubah.
        */}
				<Suspense key={query + currentPage} fallback={<TableSkeleton />}>
					<NasabahTableWrapper query={query} currentPage={currentPage} />
				</Suspense>

				{/* Komponen paginasi di bagian bawah */}
				<div className="mt-5 flex w-full justify-center">
					<Pagination totalPages={totalPages} />
				</div>
			</div>
		</div>
	);
}

/**
 * Komponen wrapper async untuk mengambil data di dalam Suspense boundary.
 * Ini adalah pola yang disarankan untuk streaming data di Server Components.
 */
async function NasabahTableWrapper({
	query,
	currentPage,
}: {
	query: string;
	currentPage: number;
}) {
	// Mengambil data nasabah sesuai dengan filter dan halaman saat ini
	const customers = await fetchFilteredCustomers(query, currentPage);
	return <NasabahTable customers={customers} />;
}
