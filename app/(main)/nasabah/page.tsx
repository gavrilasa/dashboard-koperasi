// app/(main)/nasabah/page.tsx

import { fetchFilteredCustomers } from "@/features/nasabah/data";
import { CreateNasabahButton } from "@/features/nasabah/components/nasabah-dialogs";
import { Search } from "@/components/shared/search";
import { DataTable } from "@/components/shared/data-table";
import { columns } from "@/features/nasabah/components/columns";

export const metadata = {
	title: "Manajemen Nasabah",
};

export default async function NasabahPage({
	searchParams,
}: {
	searchParams?: {
		query?: string;
		page?: string;
	};
}) {
	const query = searchParams?.query || "";
	const currentPage = Number(searchParams?.page) || 1;

	// Data fetching tetap di Server Component
	const customers = await fetchFilteredCustomers(query, currentPage);

	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-bold tracking-tight">Manajemen Nasabah</h1>

				<div className="flex items-center justify-between gap-2">
					<Search placeholder="Cari nama atau no. rekening..." />
					<CreateNasabahButton />
				</div>

				<DataTable columns={columns} data={customers} />
			</div>
		</div>
	);
}
