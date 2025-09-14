import { notFound } from "next/navigation";
import {
	fetchCustomerById,
	fetchAllCustomerTransactions,
} from "@/features/nasabah/data";
import { PrintLayout } from "@/features/nasabah/components/print-layout";

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

	return (
		<PrintLayout
			customer={customer}
			transactions={transactions}
			saldoAwal={0} // Saldo dimulai dari 0 karena semua transaksi dihitung
		/>
	);
}
