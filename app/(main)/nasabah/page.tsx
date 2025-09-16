import {
	fetchFilteredCustomers,
	fetchCustomersPages,
} from "@/features/nasabah/data";
import { CreateNasabahButton } from "@/features/nasabah/components/NasabahDialogs";
import Search from "@/components/shared/Search";
import DataTable from "@/components/shared/DataTable";
import { columns } from "@/features/nasabah/components/columns";
import Pagination from "@/components/shared/Pagination";
import { Suspense } from "react";
import TableSkeleton from "@/components/shared/Skeletons";

export const metadata = {
	title: "Manajemen Nasabah",
};

export default async function NasabahPage({
	searchParams,
}: {
	searchParams?: Promise<{
		query?: string;
		page?: string;
	}>;
}) {
	const resolvedSearchParams = await searchParams;
	const query = resolvedSearchParams?.query || "";
	const currentPage = Number(resolvedSearchParams?.page) || 1;

	const [customers, totalPages] = await Promise.all([
		fetchFilteredCustomers(query, currentPage),
		fetchCustomersPages(query),
	]);

	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-bold tracking-tight">Manajemen Nasabah</h1>

				<div className="flex items-center justify-between gap-2">
					<Search placeholder="Cari nama atau no. rekening..." />
					<CreateNasabahButton />
				</div>

				<Suspense key={query + currentPage} fallback={<TableSkeleton />}>
					<DataTable columns={columns} data={customers} />
				</Suspense>

				<div className="flex justify-end w-full mt-1">
					<Pagination totalPages={totalPages} />
				</div>
			</div>
		</div>
	);
}
