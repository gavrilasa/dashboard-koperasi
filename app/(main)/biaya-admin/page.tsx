import { AdminFeeActionCard } from "@/features/biaya-admin/components/AdminFeeActionCard";
import { AdminFeeHistory } from "@/features/biaya-admin/components/AdminFeeHistory";

export const metadata = {
	title: "Biaya Administrasi",
};

export default async function BiayaAdminPage({
	searchParams,
}: {
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const resolvedSearchParams = await searchParams;
	const query =
		typeof resolvedSearchParams?.query === "string"
			? resolvedSearchParams.query
			: "";
	const currentPage = Number(resolvedSearchParams?.page) || 1;

	return (
		<div className="flex flex-col w-full gap-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">
					Biaya Administrasi
				</h1>
				<p className="text-muted-foreground">
					Eksekusi dan lihat riwayat pembebanan biaya administrasi kepada
					nasabah.
				</p>
			</div>

			<div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-1">
					<AdminFeeActionCard />
				</div>
				<div className="lg:col-span-2">
					<AdminFeeHistory query={query} currentPage={currentPage} />
				</div>
			</div>
		</div>
	);
}
