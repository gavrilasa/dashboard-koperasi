// app/(main)/bagi-hasil/page.tsx

import { ProfitSharingActionCard } from "@/features/bagi-hasil/components/profit-sharing-action-card";
import { ProfitSharingHistory } from "@/features/bagi-hasil/components/profit-sharing-history";

export const metadata = {
	title: "Bagi Hasil",
};

// Use async pattern for Next.js 15
export default async function BagiHasilPage({
	searchParams,
}: {
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	// Must await searchParams in Next.js 15
	const resolvedSearchParams = await searchParams;
	const query =
		typeof resolvedSearchParams?.query === "string"
			? resolvedSearchParams.query
			: "";
	const currentPage = Number(resolvedSearchParams?.page) || 1;

	return (
		<div className="flex flex-col w-full gap-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Bagi Hasil</h1>
				<p className="text-muted-foreground">
					Eksekusi dan lihat riwayat pembagian hasil usaha kepada nasabah.
				</p>
			</div>

			<div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-1">
					<ProfitSharingActionCard />
				</div>
				<div className="lg:col-span-2">
					<ProfitSharingHistory query={query} currentPage={currentPage} />
				</div>
			</div>
		</div>
	);
}
