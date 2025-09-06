"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { RecipientData } from "../types";

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
			const amount = row.getValue("amountReceived") as number;
			return (
				<div className="font-semibold text-green-600">
					{formatCurrency(amount)}
				</div>
			);
		},
	},
];
