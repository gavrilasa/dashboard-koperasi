import {
	fetchCustomerTransactions,
	fetchCustomerTransactionPages,
} from "@/features/nasabah/data";
import { Pagination } from "@/components/shared/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

// Tipe props
interface TransactionHistoryProps {
	customerId: string;
	currentPage: number;
}

// Fungsi utilitas
const formatCurrency = (amount: number | bigint) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(amount);
};

const formatDateTime = (date: Date) => {
	return new Intl.DateTimeFormat("id-ID", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
};

/**
 * Komponen Server yang mengambil dan menampilkan riwayat transaksi nasabah dengan paginasi.
 */
export async function TransactionHistory({
	customerId,
	currentPage,
}: TransactionHistoryProps) {
	// Mengambil data transaksi dan total halaman secara paralel
	const [transactions, totalPages] = await Promise.all([
		fetchCustomerTransactions(customerId, currentPage),
		fetchCustomerTransactionPages(customerId),
	]);

	return (
		<div className="space-y-4">
			<div className="border rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tanggal</TableHead>
							<TableHead>Deskripsi</TableHead>
							<TableHead>Catatan</TableHead>
							<TableHead className="text-right">Jumlah</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{transactions?.length > 0 ? (
							transactions.map((tx) => (
								<TableRow key={tx.id}>
									<TableCell>{formatDateTime(tx.createdAt)}</TableCell>
									<TableCell>{tx.description}</TableCell>
									<TableCell>{tx.notes || "-"}</TableCell>
									<TableCell
										className={`text-right font-medium ${
											tx.type === "KREDIT" ? "text-green-600" : "text-red-600"
										}`}
									>
										{tx.type === "KREDIT" ? "+" : "-"}{" "}
										{formatCurrency(Number(tx.amount))}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={4} className="h-24 text-center">
									Tidak ada riwayat transaksi.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex justify-center w-full">
				<Pagination totalPages={totalPages} />
			</div>
		</div>
	);
}
