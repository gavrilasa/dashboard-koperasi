"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/utils";
import { Printer } from "lucide-react";
import { CombinedTransaction } from "../types";

interface PrintLayoutProps {
	transactions: CombinedTransaction[];
	dateRange: { from: Date; to: Date };
	openingBalance: number;
	totalDebit: number;
	totalCredit: number;
	closingBalance: number;
}

export function PrintLayout({
	transactions,
	dateRange,
	openingBalance,
	totalDebit,
	totalCredit,
	closingBalance,
}: PrintLayoutProps) {
	let runningBalance = openingBalance;

	const handlePrint = () => {
		window.print();
	};

	return (
		<div className="p-4 bg-white sm:p-8">
			<div className="max-w-4xl mx-auto">
				{/* Tombol Cetak (disembunyikan saat mencetak) */}
				<div className="flex justify-end mb-4 print:hidden">
					<Button onClick={handlePrint}>
						<Printer className="w-4 h-4 mr-2" />
						Cetak Laporan
					</Button>
				</div>

				{/* Konten yang akan dicetak */}
				<div
					id="printable-area"
					className="p-8 space-y-6 bg-white border rounded-lg shadow-sm print:border-none print:p-2 print:shadow-none"
				>
					{/* Header Laporan */}
					<header className="flex items-center justify-between pb-4 border-b">
						<div className="flex items-center gap-4">
							<Image
								src="/web-app-manifest-192x192.png"
								alt="Logo Koperasi"
								width={50}
								height={50}
							/>
							<div>
								<h1 className="text-xl font-bold text-gray-950">
									Koperasi Karyawan Ibnu Khaldun
								</h1>
								<p className="text-sm text-gray-500">
									Laporan Transaksi Gabungan
								</p>
							</div>
						</div>
						<div className="text-sm text-right">
							<p className="font-semibold">Periode Laporan</p>
							<p>
								{formatDate(dateRange.from)} - {formatDate(dateRange.to)}
							</p>
						</div>
					</header>

					<main>
						{/* Tabel Transaksi */}
						<section className="mt-6">
							{/* Ubah font size di sini */}
							<table className="w-full text-xs">
								<thead className="bg-gray-50">
									<tr>
										{/* Kurangi padding di sini */}
										<th className="px-2 py-1 font-semibold text-left">
											Tanggal
										</th>
										<th className="px-2 py-1 font-semibold text-left">
											No. Resi
										</th>
										<th className="px-2 py-1 font-semibold text-left">
											Keterangan
										</th>
										<th className="px-2 py-1 font-semibold text-right">
											Debit
										</th>
										<th className="px-2 py-1 font-semibold text-right">
											Kredit
										</th>
										<th className="px-2 py-1 font-semibold text-right">
											Saldo
										</th>
									</tr>
								</thead>
								<tbody>
									{/* Baris Saldo Awal */}
									<tr className="border-b">
										<td colSpan={5} className="px-2 py-1 font-semibold">
											Saldo Awal
										</td>
										<td className="px-2 py-1 font-semibold text-right">
											{formatCurrency(openingBalance)}
										</td>
									</tr>

									{/* Daftar Transaksi */}
									{transactions.map((tx, index) => {
										runningBalance +=
											tx.type === "KREDIT" ? tx.amount : -tx.amount;
										return (
											<tr key={index} className="border-b">
												{/* Kurangi padding di sini */}
												<td className="px-2 py-1">
													{formatDateShort(tx.createdAt)}
												</td>
												<td className="px-2 py-1 truncate max-w-24">
													{tx.receiptNumber}
												</td>
												<td className="px-2 py-1">
													{tx.customerName === "Koperasi"
														? tx.description
														: `${tx.customerName} - ${tx.description}`}
												</td>
												<td className="px-2 py-1 text-right text-red-600">
													{tx.type === "DEBIT"
														? formatCurrency(tx.amount)
														: "-"}
												</td>
												<td className="px-2 py-1 text-right text-green-600">
													{tx.type === "KREDIT"
														? formatCurrency(tx.amount)
														: "-"}
												</td>
												<td className="px-2 py-1 text-right">
													{formatCurrency(runningBalance)}
												</td>
											</tr>
										);
									})}

									{/* Kondisi jika tidak ada transaksi */}
									{transactions.length === 0 && (
										<tr>
											<td
												colSpan={6}
												className="py-12 text-center text-gray-500"
											>
												Tidak ada transaksi pada periode ini.
											</td>
										</tr>
									)}
								</tbody>
								<tfoot className="font-semibold">
									{/* Baris Total Debit & Kredit */}
									<tr className="bg-gray-50">
										<td colSpan={3} className="px-2 py-1 text-right">
											Total
										</td>
										<td className="px-2 py-1 text-right text-red-600">
											{formatCurrency(totalDebit)}
										</td>
										<td className="px-2 py-1 text-right text-green-600">
											{formatCurrency(totalCredit)}
										</td>
										<td></td>
									</tr>
									{/* Baris Saldo Akhir */}
									<tr className="border-t-2">
										<td colSpan={5} className="px-2 py-1 text-right">
											Saldo Akhir
										</td>
										<td className="px-2 py-1 text-right">
											{formatCurrency(closingBalance)}
										</td>
									</tr>
								</tfoot>
							</table>
						</section>
					</main>
				</div>
			</div>
		</div>
	);
}
