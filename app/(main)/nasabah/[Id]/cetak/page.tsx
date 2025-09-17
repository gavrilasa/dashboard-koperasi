import { notFound } from "next/navigation";
import {
	fetchCustomerById,
	fetchAllCustomerTransactions,
} from "@/features/nasabah/data";
import { PrintLayout } from "@/features/nasabah/components/PrintLayout";

export const metadata = {
	title: "Cetak Rekening Koran",
};

export default async function CetakRekeningKoranPage({
	params,
}: {
	params: Promise<{ Id: string }>;
}) {
	const resolvedParams = await params;
	const id = resolvedParams.Id;

	const customer = await fetchCustomerById(id);

	if (!customer) {
		notFound();
	}

	const transactions = await fetchAllCustomerTransactions(id);

	const initialBalance = 0;

	return (
		<PrintLayout
			customer={customer}
			transactions={transactions}
			saldoAwal={initialBalance}
		/>
	);
}
