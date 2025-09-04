// app/(main)/nasabah/[id]/cetak/page.tsx

import { notFound } from "next/navigation";
import {
	fetchCustomerById,
	calculateInitialBalance,
	fetchCustomerTransactionsByDateRange,
} from "@/features/nasabah/data";
import { PrintLayout } from "@/features/nasabah/components/print-layout";

export const metadata = {
	title: "Cetak Rekening Koran",
};

// Layout ini tidak memerlukan sidebar atau header
export default async function CetakRekeningKoranPage({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams?: {
		from?: string;
		to?: string;
	};
}) {
	const id = params.id;
	// Validasi tanggal, default ke bulan ini jika tidak ada
	const fromDate = searchParams?.from
		? new Date(searchParams.from)
		: new Date(new Date().setDate(1));
	const toDate = searchParams?.to ? new Date(searchParams.to) : new Date();

	const customer = await fetchCustomerById(id);

	if (!customer) {
		notFound();
	}

	const [initialBalance, transactions] = await Promise.all([
		calculateInitialBalance(id, fromDate),
		fetchCustomerTransactionsByDateRange(id, { from: fromDate, to: toDate }),
	]);

	// Halaman ini tidak me-render layout utama, hanya komponen PrintLayout
	return (
		<PrintLayout
			customer={customer}
			transactions={transactions}
			saldoAwal={initialBalance}
			dateRange={{
				from: fromDate.toISOString(),
				to: toDate.toISOString(),
			}}
		/>
	);
}
