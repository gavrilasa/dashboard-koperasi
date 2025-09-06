"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TransactionWithCustomer } from "../types";

const formatDateTime = (date: Date) => {
	return new Intl.DateTimeFormat("id-ID", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
};

export const columns: ColumnDef<TransactionWithCustomer>[] = [
	{
		accessorKey: "createdAt",
		header: "Tanggal",
		meta: {
			width: "20%",
		},
		cell: ({ row }) => <div>{formatDateTime(row.getValue("createdAt"))}</div>,
	},
	{
		accessorKey: "id",
		header: "No. Resi",
		meta: {
			width: "20%",
			truncate: true,
		},
	},
	{
		accessorKey: "customer.name",
		header: "Nama Nasabah",
		meta: {
			width: "25%",
			truncate: true,
		},
	},
	{
		accessorKey: "description",
		header: "Deskripsi",
		meta: {
			width: "25%",
			truncate: true,
		},
	},
	{
		accessorKey: "type",
		header: "Tipe",
		meta: {
			width: "10%",
			align: "center",
		},
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			const variant =
				type === "KREDIT"
					? "default"
					: ("destructive" as "default" | "destructive");
			return <Badge variant={variant}>{type}</Badge>;
		},
	},
	{
		accessorKey: "amount",
		header: () => <div className="text-right">Jumlah</div>,
		meta: {
			width: "15%",
			align: "right",
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("amount"));
			const type = row.original.type;
			const formattedAmount = formatCurrency(amount);

			const isCredit = type === "KREDIT";
			const amountClass = isCredit ? "text-green-600" : "text-red-600";
			const prefix = isCredit ? "+ " : "- ";

			return (
				<div className={`font-medium ${amountClass}`}>
					{prefix}
					{formattedAmount}
				</div>
			);
		},
	},
];
