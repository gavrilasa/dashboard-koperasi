import { Suspense } from "react";
import {
	fetchProfitSharingEvents,
	fetchProfitSharingPages,
} from "@/features/bagi-hasil/data";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/data-table";
import { Search } from "@/components/shared/search";
import { TableSkeleton } from "@/components/shared/skeletons";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ProfitSharingHistoryProps } from "../types";

export async function ProfitSharingHistory({
	query,
	currentPage,
}: ProfitSharingHistoryProps) {
	const [events] = await Promise.all([
		fetchProfitSharingEvents(query, currentPage),
		fetchProfitSharingPages(query),
	]);

	return (
		<Card className="shadow-lg">
			<CardHeader>
				<CardTitle>Riwayat Bagi Hasil</CardTitle>
				<CardDescription>
					Daftar semua event bagi hasil yang telah dieksekusi.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<Search placeholder="Cari berdasarkan jumlah total..." />
				</div>
				<Suspense key={query + currentPage} fallback={<TableSkeleton />}>
					<DataTable columns={columns} data={events} />
				</Suspense>
			</CardContent>
		</Card>
	);
}
