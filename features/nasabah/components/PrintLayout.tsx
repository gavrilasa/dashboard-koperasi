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
		// ----- PERBAIKAN DI SINI -----
		let pdfRunningBalance = saldoAwal; // Gunakan variabel baru untuk PDF

		const doc = new jsPDF("portrait", "mm", "a4");
		const pageHeight = 297;
		const leftMargin = 7;
		const maxContentWidth = 95;
		const lineHeight = 5;
		let yPosition = 10;

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

		const checkPageBreak = (requiredHeight: number) => {
			if (yPosition + requiredHeight > pageHeight - 10) {
				doc.addPage();
				yPosition = 10;
				addHeader();
			}
		};

		addHeader();
		doc.setFont("helvetica", "bold");
		doc.text("REKENING KORAN", leftMargin, yPosition);
		yPosition += 4;

		doc.setFontSize(7);
		doc.setFont("helvetica", "normal");
		doc.text("Nama", leftMargin, yPosition);
		doc.text(`: ${customer.name}`, leftMargin + 17, yPosition);
		yPosition += lineHeight;
		doc.text("No. Rekening", leftMargin, yPosition);
		doc.text(`: ${customer.accountNumber}`, leftMargin + 17, yPosition);
		yPosition += lineHeight;

		checkPageBreak(15);
		yPosition += 4;

		doc.setFontSize(7);
		doc.setFont("helvetica", "bold");
		doc.text("Tanggal", leftMargin, yPosition);
		doc.text("Debit", leftMargin + 35, yPosition, { align: "right" });
		doc.text("Kredit", leftMargin + 65, yPosition, { align: "right" });
		doc.text("Saldo", leftMargin + 95, yPosition, { align: "right" });
		yPosition += 3;

		doc.line(leftMargin, yPosition, leftMargin + maxContentWidth, yPosition);
		yPosition += 4;

		transactions.forEach((tx) => {
			checkPageBreak(5);
			pdfRunningBalance += tx.type === "KREDIT" ? tx.amount : -tx.amount; // Gunakan variabel PDF

			doc.setFont("courier", "normal");
			doc.setFontSize(7);
			doc.text(formatDateShort(tx.createdAt), leftMargin, yPosition);

			if (tx.type === "DEBIT") {
				doc.text(formatCurrencyDecimal(tx.amount), leftMargin + 35, yPosition, {
					align: "right",
				});
			} else {
				doc.text("-", leftMargin + 35, yPosition, { align: "right" });
			}

			if (tx.type === "KREDIT") {
				doc.text(formatCurrencyDecimal(tx.amount), leftMargin + 65, yPosition, {
					align: "right",
				});
			} else {
				doc.text("-", leftMargin + 65, yPosition, { align: "right" });
			}

			doc.text(
				formatCurrencyDecimal(pdfRunningBalance), // Gunakan variabel PDF
				leftMargin + 95,
				yPosition,
				{
					align: "right",
				}
			);

			yPosition += lineHeight;
		});

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

		const pdfBlob = doc.output("blob");
		const pdfUrl = URL.createObjectURL(pdfBlob);
		window.open(pdfUrl, "_blank");

		setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
	};

	const handlePrint = () => {
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
				<div className="flex justify-end mb-4 print:hidden">
					<Button onClick={handlePrint}>
						<Printer className="w-4 h-4 mr-2" />
						Cetak Laporan
					</Button>
				</div>
				<div
					id="printable-area"
					className="p-8 space-y-6 bg-white border rounded-lg shadow-sm print:border-none print:p-2 print:shadow-none"
				>
					<header className="flex items-center justify-between pb-4 border-b">
						<div>
							<h1 className="text-2xl font-bold text-gray-950">
								Koperasi Ibnu Khaldun
							</h1>
							<p className="text-sm text-gray-500">
								Kota Bontang, Kalimantan Timur
							</p>
						</div>
					</header>
					<main>
						<section className="space-y-4">
							<h2 className="text-xl font-semibold text-center">
								REKENING KORAN
							</h2>
							<div className="p-4 text-sm border rounded-lg grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
								<span className="font-semibold">Nama Nasabah</span>
								<span>: {customer.name}</span>
								<span className="font-semibold">Nomor Rekening</span>
								<span>: {customer.accountNumber}</span>
							</div>
						</section>
						<section className="mt-6">
							<table className="w-full text-sm">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-2 font-semibold text-left">
											Tanggal
										</th>
										<th className="px-4 py-2 font-semibold text-right">
											Debit
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
									{transactions.map((tx) => {
										runningBalance +=
											tx.type === "KREDIT" ? tx.amount : -tx.amount;
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
												<td className="px-4 py-2 text-right">
													{formatCurrencyDecimal(runningBalance)}
												</td>
											</tr>
										);
									})}
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
										<td colSpan={1} className="px-4 py-2 text-right">
											Total
										</td>
										<td className="px-4 py-2 text-right">
											{formatCurrencyDecimal(totalDebit)}
										</td>
										<td className="px-4 py-2 text-right">
											{formatCurrencyDecimal(totalKredit)}
										</td>
										<td className="px-4 py-2 text-right">
											{formatCurrencyDecimal(runningBalance)}
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
