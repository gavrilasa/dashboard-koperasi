import { notFound } from "next/navigation";
import { startOfDay, endOfDay } from "date-fns";
import {
	fetchAllCombinedTransactionsForPrint,
	calculateOpeningBalance,
} from "@/features/transaksi/data";
import { PrintLayout } from "@/features/transaksi/components/PrintLayout";

export const metadata = {
	title: "Cetak Laporan Transaksi",
};

export default async function CetakTransaksiPage({
	searchParams,
}: {
	searchParams?: Promise<{
		from?: string;
		to?: string;
	}>;
}) {
	const resolvedSearchParams = await searchParams;

	const fromDate = resolvedSearchParams?.from
		? startOfDay(new Date(resolvedSearchParams.from))
		: undefined;
	const toDate = resolvedSearchParams?.to
		? endOfDay(new Date(resolvedSearchParams.to))
		: undefined;

	if (!fromDate || !toDate) {
		return notFound();
	}

	const [transactions, openingBalance] = await Promise.all([
		fetchAllCombinedTransactionsForPrint({ from: fromDate, to: toDate }),
		calculateOpeningBalance(fromDate),
	]);

	const totalDebit = transactions
		.filter((tx) => tx.type === "DEBIT")
		.reduce((sum, tx) => sum + tx.amount, 0);

	const totalCredit = transactions
		.filter((tx) => tx.type === "KREDIT")
		.reduce((sum, tx) => sum + tx.amount, 0);

	const closingBalance = openingBalance + totalCredit - totalDebit;

	return (
		<PrintLayout
			transactions={transactions}
			dateRange={{ from: fromDate, to: toDate }}
			openingBalance={openingBalance}
			totalDebit={totalDebit}
			totalCredit={totalCredit}
			closingBalance={closingBalance}
		/>
	);
}
