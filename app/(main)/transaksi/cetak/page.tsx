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
	searchParams?: {
		from?: string;
		to?: string;
	};
}) {
	const fromDate = searchParams?.from
		? startOfDay(new Date(searchParams.from))
		: undefined;
	const toDate = searchParams?.to
		? endOfDay(new Date(searchParams.to))
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
