"use client";

import { Button } from "@/components/ui/button";
import { formatCurrencyDecimal, formatDateShort } from "@/lib/utils";
import { Printer } from "lucide-react";
import { PrintLayoutProps } from "../types";
import jsPDF from "jspdf";

export function PrintLayout({
	customer,
	transactions,
	saldoAwal,
}: PrintLayoutProps) {
	let runningBalance = saldoAwal;
	const totalKredit = transactions
		.filter((tx) => tx.type === "KREDIT")
		.reduce((sum, tx) => sum + tx.amount, 0);
	const totalDebit = transactions
		.filter((tx) => tx.type === "DEBIT")
		.reduce((sum, tx) => sum + tx.amount, 0);

	const generatePDF = () => {
		const doc = new jsPDF("portrait", "mm", "a4");
		const pageHeight = 297;
		const leftMargin = 7;
		const maxContentWidth = 95;
		const lineHeight = 5;

		let yPosition = 10;
		let currentPage = 1; // eslint-disable-line @typescript-eslint/no-unused-vars

		// Helper function to check if we need a new page
		const checkPageBreak = (requiredHeight: number) => {
			if (yPosition + requiredHeight > pageHeight - 10) {
				doc.addPage();
				currentPage++;
				yPosition = 10;
				// Add header on new page
				addHeader();
			}
		};

		// Helper function to add header on each page
		const addHeader = () => {
			doc.setFontSize(10);
			doc.setFont("helvetica", "bold");
			doc.text("Koperasi Ibnu Khaldun", leftMargin, yPosition);
			yPosition += 4;

			doc.setFontSize(7);
			doc.setFont("helvetica", "normal");
			doc.text("Kota Bontang, Kalimantan Timur", leftMargin, yPosition);
			yPosition += 6;
		};

		// Add initial header
		addHeader();

		// Title - left aligned
		doc.setFont("helvetica", "bold");
		doc.text("REKENING KORAN", leftMargin, yPosition);
		yPosition += 4;

		// Customer information
		doc.setFontSize(7);
		doc.setFont("helvetica", "normal");

		doc.text("Nama", leftMargin, yPosition);
		doc.text(": " + customer.name, leftMargin + 17, yPosition);
		yPosition += lineHeight;

		doc.text("No. Rekening", leftMargin, yPosition);
		doc.text(": " + customer.accountNumber, leftMargin + 17, yPosition);
		yPosition += lineHeight;

		// Table header
		checkPageBreak(15);
		yPosition += 4;

		doc.setFontSize(7);
		doc.setFont("helvetica", "bold");
		doc.text("Tanggal", leftMargin, yPosition);
		doc.text("Debet", leftMargin + 35, yPosition, { align: "right" });
		doc.text("Kredit", leftMargin + 65, yPosition, { align: "right" });
		doc.text("Saldo", leftMargin + 95, yPosition, { align: "right" });
		yPosition += 3;

		// Draw line under header
		doc.line(leftMargin, yPosition, leftMargin + maxContentWidth, yPosition);
		yPosition += 4;

		// Transaction rows
		transactions.forEach((tx) => {
			checkPageBreak(5);

			if (tx.type === "KREDIT") {
				runningBalance += tx.amount;
			} else {
				runningBalance -= tx.amount;
			}

			// Date
			doc.setFont("courier", "normal");
			doc.setFontSize(7);
			doc.text(formatDateShort(tx.createdAt), leftMargin, yPosition);

			// Use monospace font for currency
			doc.setFont("courier", "normal");
			doc.setFontSize(7);

			// Debit
			if (tx.type === "DEBIT") {
				doc.text(formatCurrencyDecimal(tx.amount), leftMargin + 35, yPosition, {
					align: "right",
				});
			} else {
				doc.text("-", leftMargin + 35, yPosition, { align: "right" });
			}

			// Credit
			if (tx.type === "KREDIT") {
				doc.text(formatCurrencyDecimal(tx.amount), leftMargin + 65, yPosition, {
					align: "right",
				});
			} else {
				doc.text("-", leftMargin + 65, yPosition, { align: "right" });
			}

			// Running balance
			doc.text(
				formatCurrencyDecimal(runningBalance),
				leftMargin + 95,
				yPosition,
				{
					align: "right",
				}
			);

			yPosition += lineHeight * Math.max(1);
		});

		// No transactions message
		if (transactions.length === 0) {
			checkPageBreak(5);
			doc.setFontSize(7);
			doc.setFont("courier", "normal");
			doc.text(
				"Tidak ada transaksi pada periode ini.",
				leftMargin + 35,
				yPosition,
				{ align: "center" }
			);
			yPosition += 8;
		}

		// Preview the PDF
		const pdfBlob = doc.output("blob");
		const pdfUrl = URL.createObjectURL(pdfBlob);
		window.open(pdfUrl, "_blank");

		// Clean up
		setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
	};

	const handlePrint = () => {
		// Check if we should generate PDF or use browser print
		if (
			window.confirm(
				"Pilih format cetak:\nOK = PDF (Rekening Koran Format)\nCancel = Browser Print (Full Width)"
			)
		) {
			generatePDF();
		} else {
			window.print();
		}
	};

	return (
		<div className="p-4 bg-white sm:p-8">
			<div className="max-w-4xl mx-auto">
				{/* Print Action Button */}
				<div className="flex justify-end mb-4 print:hidden">
					<Button onClick={handlePrint}>
						<Printer className="w-4 h-4 mr-2" />
						Cetak Laporan
					</Button>
				</div>

				{/* Content for browser print fallback */}
				<div
					id="printable-area"
					className="p-8 space-y-6 bg-white border rounded-lg shadow-sm print:border-none print:p-2 print:shadow-none"
				>
					{/* Header */}
					<header className="flex items-center justify-between pb-4 border-b">
						<div>
							<h1 className="text-2xl font-bold text-gray-950">
								Koperasi Simpan Pinjam
							</h1>
							<p className="text-sm text-gray-500">
								Kota Bontang, Kalimantan Timur
							</p>
						</div>
					</header>

					<main>
						{/* Title and Customer Details */}
						<section className="space-y-4">
							<h2 className="text-xl font-semibold text-center">
								REKENING KORAN
							</h2>
							<div className="grid grid-cols-2 p-4 text-sm border rounded-lg gap-x-8">
								<div className="space-y-2">
									<div>
										<p className="font-semibold">Nama Nasabah:</p>
										<p>{customer.name}</p>
									</div>
								</div>
								<div className="space-y-2">
									<div>
										<p className="font-semibold">Nomor Rekening:</p>
										<p>{customer.accountNumber}</p>
									</div>
								</div>
							</div>
						</section>

						{/* Transaction Table */}
						<section className="mt-6">
							<table className="w-full text-sm">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-2 font-semibold text-left">
											Tanggal
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
									{/* Transaction List */}
									{transactions.map((tx) => {
										if (tx.type === "KREDIT") {
											runningBalance += tx.amount;
										} else {
											runningBalance -= tx.amount;
										}
										return (
											<tr key={tx.id} className="border-b">
												<td className="px-4 py-2">
													{formatDateShort(tx.createdAt)}
												</td>
												<td className="px-4 py-2 text-right">
													{tx.type === "DEBIT"
														? formatCurrencyDecimal(tx.amount)
														: "-"}
												</td>
												<td className="px-4 py-2 text-right">
													{tx.type === "KREDIT"
														? formatCurrencyDecimal(tx.amount)
														: "-"}
												</td>
											</tr>
										);
									})}

									{/* Empty state */}
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
								<tfoot className="font-semibold">
									<tr className="bg-gray-50">
										<td colSpan={2} className="px-4 py-2 text-right">
											Total
										</td>
										<td className="px-4 py-2 text-right">
											{formatCurrencyDecimal(totalDebit)}
										</td>
										<td className="px-4 py-2 text-right">
											{formatCurrencyDecimal(totalKredit)}
										</td>
										<td></td>
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
