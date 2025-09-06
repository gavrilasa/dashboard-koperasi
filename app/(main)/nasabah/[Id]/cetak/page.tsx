import { notFound } from "next/navigation";
import {
	fetchCustomerById,
	calculateInitialBalance,
	fetchCustomerTransactionsByDateRange,
} from "@/features/nasabah/data";
import { PrintLayout } from "@/features/nasabah/components/print-layout";
import { startOfDay, endOfDay } from "date-fns";

export const metadata = {
	title: "Cetak Rekening Koran",
};

export default async function CetakRekeningKoranPage({
	params,
	searchParams,
}: {
	params: Promise<{ Id: string }>;
	searchParams?: Promise<{
		from?: string;
		to?: string;
	}>;
}) {
	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;
	const id = resolvedParams.Id;

	const fromDate = resolvedSearchParams?.from
		? startOfDay(new Date(resolvedSearchParams.from))
		: startOfDay(new Date(new Date().setDate(1)));
	const toDate = resolvedSearchParams?.to
		? endOfDay(new Date(resolvedSearchParams.to))
		: endOfDay(new Date());

	const customer = await fetchCustomerById(id);

	if (!customer) {
		notFound();
	}

	const [initialBalance, transactions] = await Promise.all([
		calculateInitialBalance(id, fromDate),
		fetchCustomerTransactionsByDateRange(id, { from: fromDate, to: toDate }),
	]);

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
