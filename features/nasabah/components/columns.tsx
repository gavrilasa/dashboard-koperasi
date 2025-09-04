// features/nasabah/components/columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Customer } from "../types";
import { formatCurrency } from "@/lib/utils";
import { CustomerTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Customer>[] = [
	{
		accessorKey: "name",
		header: "Nama Nasabah",
		meta: {
			width: "30%", // Paling lebar
			align: "left",
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
			width: "25%",
			align: "left",
			truncate: true,
		},
	},
	{
		accessorKey: "balance",
		header: "Saldo",
		meta: {
			width: "20%",
			align: "right", // Angka rata kanan
		},
		cell: ({ row }) => {
			const balance = parseFloat(row.getValue("balance"));
			return <div className="font-semibold">{formatCurrency(balance)}</div>;
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		meta: {
			width: "15%",
			align: "center", // Status di tengah
		},
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			const variant =
				status === "ACTIVE"
					? "default"
					: ("destructive" as "default" | "destructive");
			const text = status === "ACTIVE" ? "Aktif" : "Tidak Aktif";

			return <Badge variant={variant}>{text}</Badge>;
		},
	},
	{
		id: "actions",
		header: "Aksi",
		meta: {
			width: "10%",
			align: "center",
		},
		cell: ({ row }) => <CustomerTableRowActions customer={row.original} />,
	},
];
