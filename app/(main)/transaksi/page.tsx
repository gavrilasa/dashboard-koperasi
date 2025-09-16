import { Suspense } from "react";
import Link from "next/link";
import { format, startOfMonth } from "date-fns";
import { Printer } from "lucide-react";
import { fetchCombinedTransactions } from "@/features/transaksi/data";
import { DataTable } from "@/components/shared/data-table";
import { columns } from "@/features/transaksi/components/columns";
import { Search } from "@/components/shared/search";
import { Pagination } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/skeletons";
import { TransactionDateRangeFilter } from "@/features/transaksi/components/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/shared/ClientOnly";

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

	const printUrl = `/transaksi/cetak?from=${format(
		fromDate,
		"yyyy-MM-dd"
	)}&to=${format(toDate, "yyyy-MM-dd")}`;

	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-bold tracking-tight">Riwayat Transaksi</h1>
				<p className="text-muted-foreground">
					Lihat dan kelola semua transaksi yang tercatat dalam sistem.
				</p>

				<div className="flex items-center justify-between gap-2">
					<ClientOnly>
						<TransactionDateRangeFilter />
					</ClientOnly>
					<Search placeholder="Cari No. Resi atau nama nasabah..." />
					<Button asChild>
						<Link href={printUrl} target="_blank">
							<Printer className="w-4 h-4 mr-2" />
							Cetak Laporan
						</Link>
					</Button>
				</div>

				<Suspense
					key={
						query + currentPage + fromDate.toISOString() + toDate.toISOString()
					}
					fallback={<TableSkeleton />}
				>
					<DataTable columns={columns} data={transactions} />
				</Suspense>

				<div className="flex justify-end w-full mt-1">
					<Pagination totalPages={totalPages} />
				</div>
			</div>
		</div>
	);
}
