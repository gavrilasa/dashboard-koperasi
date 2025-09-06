"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import type { SafeProfitSharingEvent } from "../types";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export const columns: ColumnDef<SafeProfitSharingEvent>[] = [
	{
		accessorKey: "executedAt",
		header: "Tanggal Eksekusi",
		meta: {
			width: "20%",
		},
		cell: ({ row }) => <div>{formatDate(row.getValue("executedAt"))}</div>,
	},
	{
		accessorKey: "totalAmountShared",
		header: () => <div className="text-right">Total Dibagikan</div>,
		meta: {
			width: "25%",
			align: "right",
		},
		cell: ({ row }) => {
			const total = row.getValue("totalAmountShared") as number;
			return <div className="font-semibold">{formatCurrency(total)}</div>;
		},
	},
	{
		accessorKey: "numberOfRecipients",
		header: () => <div className="text-center">Jumlah Penerima</div>,
		meta: {
			width: "20%",
			align: "center",
		},
		cell: ({ row }) => <div>{row.getValue("numberOfRecipients")} Nasabah</div>,
	},
	{
		accessorKey: "amountPerRecipient",
		header: () => <div className="text-right">Jumlah per Nasabah</div>,
		meta: {
			width: "25%",
			align: "right",
		},
		cell: ({ row }) => {
			const amount = row.getValue("amountPerRecipient") as number;
			return <div className="font-medium">{formatCurrency(amount)}</div>;
		},
	},
	{
		id: "actions",
		header: () => <div className="text-center">Aksi</div>,
		meta: {
			width: "10%",
			align: "center",
		},
		cell: ({ row }) => {
			const event = row.original;
			return (
				<Button asChild variant="outline" size="sm">
					<Link href={`/bagi-hasil/${event.id}`}>
						Detail
						<ArrowRight className="w-4 h-4 ml-2" />
					</Link>
				</Button>
			);
		},
	},
];
