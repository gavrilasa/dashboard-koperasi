"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer } from "lucide-react";
import { PrintLayoutProps } from "../types";

export function PrintLayout({
	customer,
	transactions,
	dateRange,
	saldoAwal,
}: PrintLayoutProps) {
	let runningBalance = saldoAwal;
	const totalKredit = transactions
		.filter((tx) => tx.type === "KREDIT")
		.reduce((sum, tx) => sum + tx.amount, 0);
	const totalDebit = transactions
		.filter((tx) => tx.type === "DEBIT")
		.reduce((sum, tx) => sum + tx.amount, 0);
	const saldoAkhir = saldoAwal + totalKredit - totalDebit;

	return (
		<div className="p-4 bg-gray-100 sm:p-8 print:bg-white print:p-0">
			<div className="max-w-4xl mx-auto">
				{/* Tombol Aksi Cetak - Akan disembunyikan saat mencetak */}
				<div className="flex justify-end mb-4 print:hidden">
					<Button onClick={() => window.print()}>
						<Printer className="w-4 h-4 mr-2" />
						Cetak Laporan
					</Button>
				</div>

				{/* Konten yang akan dicetak */}
				<div
					id="printable-area"
					className="p-8 space-y-6 bg-white border rounded-lg shadow-sm print:border-none print:p-2 print:shadow-none"
				>
					{/* 1. Kop Surat */}
					<header className="flex items-center justify-between pb-4 border-b">
						<div>
							<h1 className="text-2xl font-bold text-gray-800">
								Koperasi Simpan Pinjam
							</h1>
							<p className="text-sm text-gray-500">
								Kota Bontang, Kalimantan Timur
							</p>
						</div>
						{/* Anda bisa menambahkan logo di sini */}
						{/* <img src="/logo.png" alt="Logo Koperasi" className="h-12" /> */}
					</header>

					<main>
						{/* 2. Judul dan Detail Nasabah */}
						<section className="space-y-4">
							<h2 className="text-xl font-semibold text-center">
								REKENING KORAN
							</h2>
							<div className="grid grid-cols-2 p-4 text-sm border rounded-lg gap-x-8">
								{/* Kolom Kiri */}
								<div className="space-y-2">
									<div>
										<p className="font-semibold">Nama Nasabah:</p>
										<p>{customer.name}</p>
									</div>
									<div>
										<p className="font-semibold">Alamat:</p>
										<p>{customer.address}</p>
									</div>
								</div>

								{/* Kolom Kanan */}
								<div className="space-y-2">
									<div>
										<p className="font-semibold">Nomor Rekening:</p>
										<p>{customer.accountNumber}</p>
									</div>
									<div>
										<p className="font-semibold">Periode:</p>
										<p>
											{formatDate(dateRange.from)} - {formatDate(dateRange.to)}
										</p>
									</div>
								</div>
							</div>
						</section>

						{/* 3. Tabel Transaksi */}
						<section className="mt-6">
							<table className="w-full text-sm">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-2 font-semibold text-left">
											Tanggal
										</th>
										<th className="px-4 py-2 font-semibold text-left">
											Deskripsi
										</th>
										<th className="px-4 py-2 font-semibold text-right">
											Debet
										</th>
										<th className="px-4 py-2 font-semibold text-right">
											Kredit
										</th>
										<th className="px-4 py-2 font-semibold text-right">
											Saldo
										</th>
									</tr>
								</thead>
								<tbody>
									{/* Saldo Awal */}
									<tr className="border-b">
										<td colSpan={4} className="px-4 py-2 font-medium">
											Saldo Awal per {formatDate(dateRange.from)}
										</td>
										<td className="px-4 py-2 font-medium text-right">
											{formatCurrency(saldoAwal)}
										</td>
									</tr>

									{/* Daftar Transaksi */}
									{transactions.map((tx) => {
										if (tx.type === "KREDIT") {
											runningBalance += tx.amount;
										} else {
											runningBalance -= tx.amount;
										}
										return (
											<tr key={tx.id} className="border-b">
												<td className="px-4 py-2">
													{formatDate(tx.createdAt)}
												</td>
												<td className="px-4 py-2">{tx.description}</td>
												<td className="px-4 py-2 text-right">
													{tx.type === "DEBIT"
														? formatCurrency(tx.amount)
														: "-"}
												</td>
												<td className="px-4 py-2 text-right">
													{tx.type === "KREDIT"
														? formatCurrency(tx.amount)
														: "-"}
												</td>
												<td className="px-4 py-2 text-right">
													{formatCurrency(runningBalance)}
												</td>
											</tr>
										);
									})}

									{/* Baris Kosong jika tidak ada transaksi */}
									{transactions.length === 0 && (
										<tr>
											<td
												colSpan={5}
												className="py-12 text-center text-gray-500"
											>
												Tidak ada transaksi pada periode ini.
											</td>
										</tr>
									)}
								</tbody>
								{/* 4. Ringkasan Saldo Akhir */}
								<tfoot className="font-semibold">
									<tr className="bg-gray-50">
										<td colSpan={2} className="px-4 py-2 text-right">
											Total
										</td>
										<td className="px-4 py-2 text-right">
											{formatCurrency(totalDebit)}
										</td>
										<td className="px-4 py-2 text-right">
											{formatCurrency(totalKredit)}
										</td>
										<td></td>
									</tr>
									<tr className="border-t-2">
										<td colSpan={4} className="px-4 py-2 text-right">
											Saldo Akhir per {formatDate(dateRange.to)}
										</td>
										<td className="px-4 py-2 text-right">
											{formatCurrency(saldoAkhir)}
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
