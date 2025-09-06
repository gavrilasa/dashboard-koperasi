"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { AffectedCustomerData } from "../types";

export const affectedCustomerListColumns: ColumnDef<AffectedCustomerData>[] = [
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
		accessorKey: "amountCharged",
		header: () => <div className="text-right">Jumlah Biaya</div>,
		meta: {
			width: "25%",
			align: "right",
		},
		cell: ({ row }) => {
			const amount = row.getValue("amountCharged") as number;
			return (
				<div className="font-semibold text-red-600">
					{formatCurrency(amount)}
				</div>
			);
		},
	},
];
