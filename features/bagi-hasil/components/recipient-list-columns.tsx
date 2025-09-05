// features/bagi-hasil/components/recipient-list-columns.tsx

"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { Customer } from "@prisma/client";

// Tipe data kustom untuk baris tabel, menggabungkan data nasabah dengan jumlah yang diterima
export type RecipientData = Pick<Customer, "id" | "name" | "accountNumber"> & {
	amountReceived: number | any; // Dibuat `any` untuk mengakomodasi tipe Decimal dari Prisma
};

// Definisi kolom untuk tabel daftar penerima bagi hasil
export const recipientListColumns: ColumnDef<RecipientData>[] = [
	{
		accessorKey: "name",
		header: "Nama Nasabah",
		meta: {
			width: "40%",
			truncate: true,
		},
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		accessorKey: "accountNumber",
		header: "Nomor Rekening",
		meta: {
			width: "35%",
			truncate: true,
		},
	},
	{
		accessorKey: "amountReceived",
		header: () => <div className="text-right">Jumlah Diterima</div>,
		meta: {
			width: "25%",
			align: "right",
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("amountReceived"));
			return (
				<div className="font-semibold text-green-600">
					{formatCurrency(amount)}
				</div>
			);
		},
	},
];
