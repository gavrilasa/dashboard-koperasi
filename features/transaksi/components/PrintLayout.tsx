"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	formatCurrency,
	formatCurrencyDecimal,
	formatDate,
	formatDateShort,
} from "@/lib/utils";
import { Printer } from "lucide-react";
import { CombinedTransaction } from "../types";
import { GeistMono } from "geist/font/mono";

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
			<style jsx>{`
				.mono-font {
					font-family: "Geist Mono", "JetBrains Mono", "Fira Code", "Consolas",
						monospace;
				}
			`}</style>
			<div className="max-w-4xl mx-auto">
				{/* Print Action Button (hidden during print) */}
				<div className="flex justify-end mb-4 print:hidden">
					<Button onClick={handlePrint}>
						<Printer className="w-4 h-4 mr-2" />
						Cetak Laporan
					</Button>
				</div>

				{/* Printable Area */}
				<div
					id="printable-area"
					className="p-8 space-y-6 bg-white border rounded-lg shadow-sm print:border-none print:p-2 print:shadow-none"
				>
					{/* Header (will repeat on each page) */}
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
									Koperasi Ibnu Khaldun
								</h1>
								<p className="text-sm text-gray-500">
									Laporan Transaksi Koperasi
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
						<section className="mt-6">
							<table
								className="w-full text-xs"
								style={{ tableLayout: "fixed" }}
							>
								{/* Use table-header-group to make it repeat on each page */}
								<thead
									style={{ display: "table-header-group" }}
									className="bg-gray-50"
								>
									<tr>
										<th className="px-2 py-1 font-semibold text-left w-[10%]">
											Tanggal
										</th>
										<th className="px-2 py-1 font-semibold text-left w-[15%]">
											No. Resi
										</th>
										<th className="px-2 py-1 font-semibold text-left w-[25%]">
											Nasabah
										</th>
										<th className="px-2 py-1 font-semibold text-right w-[15%]">
											Debit
										</th>
										<th className="px-2 py-1 font-semibold text-right w-[15%]">
											Kredit
										</th>
										<th className="px-2 py-1 font-semibold text-right w-[20%]">
											Saldo
										</th>
									</tr>
								</thead>

								<tbody className="mono-font">
									<tr className="border-b">
										<td colSpan={5} className="px-2 py-1 font-semibold">
											Saldo Awal
										</td>
										<td className="px-2 py-1 font-semibold text-right">
											{formatCurrencyDecimal(openingBalance)}
										</td>
									</tr>

									{transactions.map((tx, index) => {
										runningBalance +=
											tx.type === "KREDIT" ? tx.amount : -tx.amount;
										return (
											<tr
												key={index}
												className="border-b"
												style={{ pageBreakInside: "avoid" }}
											>
												<td className="px-2 py-1">
													{formatDateShort(tx.createdAt)}
												</td>
												<td className="px-2 py-1 truncate">
													{tx.receiptNumber}
												</td>
												<td className="px-2 py-1 truncate">
													{tx.customerName}
												</td>
												<td className="px-2 py-1 text-right text-red-600">
													{tx.type === "DEBIT"
														? formatCurrencyDecimal(tx.amount)
														: "-"}
												</td>
												<td className="px-2 py-1 text-right text-green-600">
													{tx.type === "KREDIT"
														? formatCurrencyDecimal(tx.amount)
														: "-"}
												</td>
												<td className="px-2 py-1 text-right">
													{formatCurrencyDecimal(runningBalance)}
												</td>
											</tr>
										);
									})}

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

									{/* Total row as last tbody row instead of tfoot */}
									<tr className="border-t-2 bg-gray-50 font-semibold">
										<td colSpan={3} className="px-2 py-1 text-right">
											Total
										</td>
										<td className="px-2 py-1 text-right text-red-600">
											{formatCurrency(totalDebit)}
										</td>
										<td className="px-2 py-1 text-right text-green-600">
											{formatCurrency(totalCredit)}
										</td>
										<td className="px-2 py-1 text-right">
											{formatCurrency(closingBalance)}
										</td>
									</tr>
								</tbody>
							</table>
						</section>
					</main>
				</div>
			</div>
		</div>
	);
}
