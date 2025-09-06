import { Suspense } from "react";
import {
	fetchAdminFeeEvents,
	fetchAdminFeePages,
} from "@/features/biaya-admin/data";
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
import { Pagination } from "@/components/shared/pagination";
import { AdminFeeHistoryProps } from "../types";

export async function AdminFeeHistory({
	query,
	currentPage,
}: AdminFeeHistoryProps) {
	const [events, totalPages] = await Promise.all([
		fetchAdminFeeEvents(query, currentPage),
		fetchAdminFeePages(query),
	]);

	return (
		<Card className="shadow-lg">
			<CardHeader>
				<CardTitle>Riwayat Biaya Administrasi</CardTitle>
				<CardDescription>
					Daftar semua event pembebanan biaya administrasi yang telah
					dieksekusi.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<Search placeholder="Cari berdasarkan deskripsi..." />
				</div>
				<Suspense key={query + currentPage} fallback={<TableSkeleton />}>
					<DataTable columns={columns} data={events} />
				</Suspense>
				<div className="flex justify-end w-full mt-1">
					<Pagination totalPages={totalPages} />
				</div>
			</CardContent>
		</Card>
	);
}
