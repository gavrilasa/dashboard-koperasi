// app/(main)/transaksi/page.tsx

import { Suspense } from "react";
import {
	fetchFilteredTransactions,
	fetchTransactionPages,
} from "@/features/transaksi/data";
import { DataTable } from "@/components/shared/data-table";
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
	};
}) {
	const query = searchParams?.query || "";
	const currentPage = Number(searchParams?.page) || 1;

	const [transactions, totalPages] = await Promise.all([
		fetchFilteredTransactions(query, currentPage),
		fetchTransactionPages(query),
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
				</div>

				<Suspense key={query + currentPage} fallback={<TableSkeleton />}>
					<DataTable columns={columns} data={transactions} />
				</Suspense>

				<div className="flex justify-end w-full mt-1">
					<Pagination totalPages={totalPages} />
				</div>
			</div>
		</div>
	);
}
