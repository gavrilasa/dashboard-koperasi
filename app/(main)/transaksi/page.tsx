// app/(main)/transaksi/page.tsx

import { Suspense } from "react";
import {
	fetchFilteredTransactions,
	fetchTransactionPages,
} from "@/features/transaksi/data";
import { TransactionDataTable } from "@/features/transaksi/components/data-table";
import { columns } from "@/features/transaksi/components/columns";
import { Search } from "@/components/shared/search";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/skeletons";

export const metadata = {
	title: "Riwayat Transaksi",
};

export default async function TransaksiPage({
	searchParams,
}: {
	searchParams?: {
		query?: string;
		page?: string;
		// Anda dapat menambahkan parameter untuk tanggal di sini
		// from?: string;
		// to?: string;
	};
}) {
	const query = searchParams?.query || "";
	const currentPage = Number(searchParams?.page) || 1;
	// Logika untuk mengambil dan mem-parsing rentang tanggal akan ditambahkan di sini
	// const dateRange = {
	//  from: searchParams?.from ? new Date(searchParams.from) : undefined,
	//  to: searchParams?.to ? new Date(searchParams.to) : undefined,
	// };

	// Mengambil data dan total halaman secara paralel
	const [transactions, totalPages] = await Promise.all([
		fetchFilteredTransactions(query, currentPage /*, dateRange */),
		fetchTransactionPages(query /*, dateRange */),
	]);

	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h1>
				<p className="text-muted-foreground">
					Lihat dan kelola semua transaksi yang tercatat dalam sistem.
				</p>

				<div className="flex items-center justify-between gap-2">
					<Search placeholder="Cari No. Resi atau nama nasabah..." />
					{/* TODO: Tambahkan komponen DatePicker di sini */}
					{/* <DateRangePicker /> */}
				</div>

				<Suspense key={query + currentPage} fallback={<TableSkeleton />}>
					<TransactionDataTable columns={columns} data={transactions} />
				</Suspense>

				<div className="flex justify-center w-full mt-4">
					<Pagination totalPages={totalPages} />
				</div>
			</div>
		</div>
	);
}
