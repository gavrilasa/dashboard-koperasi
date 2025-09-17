// app/(main)/transaksi/page.tsx

import { Suspense } from "react";
import { startOfMonth } from "date-fns";
import { fetchCombinedTransactions } from "@/features/transaksi/data";
import { columns } from "@/features/transaksi/components/columns";
import Search from "@/components/shared/Search";
import Pagination from "@/components/shared/Pagination";
import TableSkeleton from "@/components/shared/Skeletons";
import { TransactionDateRangeFilter } from "@/features/transaksi/components/DateRangeFilter";
import ClientOnly from "@/components/shared/ClientOnly";
import { PrintTransactionDialog } from "@/features/transaksi/components/PrintTransactionDialog";
import { TransactionDataTable } from "@/features/transaksi/components/DataTable";

export const metadata = {
	title: "Riwayat Transaksi",
};

export default async function TransaksiPage({
	searchParams,
}: {
	searchParams?: Promise<{
		query?: string;
		page?: string;
		from?: string;
		to?: string;
	}>;
}) {
	const resolvedSearchParams = await searchParams;
	const query = resolvedSearchParams?.query || "";
	const currentPage = Number(resolvedSearchParams?.page) || 1;
	const fromDate = resolvedSearchParams?.from
		? new Date(resolvedSearchParams.from)
		: startOfMonth(new Date());
	const toDate = resolvedSearchParams?.to
		? new Date(resolvedSearchParams.to)
		: new Date();

	const { transactions, totalPages } = await fetchCombinedTransactions(
		query,
		currentPage,
		{ from: fromDate, to: toDate }
	);

	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-col gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Riwayat Transaksi
					</h1>
					<p className="text-muted-foreground">
						Lihat dan kelola semua transaksi yang tercatat dalam sistem.
					</p>
				</div>

				<div className="flex items-center justify-between gap-2">
					<Search placeholder="Cari No. Resi atau nama nasabah..." />
					<div className="flex gap-2">
						<ClientOnly>
							<TransactionDateRangeFilter />
							<PrintTransactionDialog />
						</ClientOnly>
					</div>
				</div>

				<Suspense
					key={
						query + currentPage + fromDate.toISOString() + toDate.toISOString()
					}
					fallback={<TableSkeleton />}
				>
					<TransactionDataTable columns={columns} data={transactions} />
				</Suspense>

				<div className="flex justify-end w-full mt-1">
					<Pagination totalPages={totalPages} />
				</div>
			</div>
		</div>
	);
}
