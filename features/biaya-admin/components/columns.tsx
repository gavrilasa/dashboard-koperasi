"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { SafeAdminFeeEvent } from "../types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const columns: ColumnDef<SafeAdminFeeEvent>[] = [
	{
		accessorKey: "executedAt",
		header: "Tanggal Eksekusi",
		meta: {
			width: "20%",
		},
		cell: ({ row }) => <div>{formatDate(row.getValue("executedAt"))}</div>,
	},
	{
		accessorKey: "numberOfAffectedCustomers",
		header: () => <div className="text-center">Jumlah Nasabah</div>,
		meta: {
			width: "30%",
			align: "center",
		},
		cell: ({ row }) => (
			<div>{row.getValue("numberOfAffectedCustomers")} Nasabah</div>
		),
	},
	{
		accessorKey: "totalAmountCollected",
		header: () => <div className="text-center">Total Terkumpul</div>,
		meta: {
			width: "30%",
			align: "center",
		},
		cell: ({ row }) => {
			const total = row.getValue("totalAmountCollected") as number;
			return <div className="font-semibold">{formatCurrency(total)}</div>;
		},
	},

	{
		id: "actions",
		header: () => <div className="text-center">Aksi</div>,
		meta: {
			width: "20%",
			align: "center",
		},
		cell: ({ row }) => {
			const event = row.original;
			return (
				<Button asChild variant="outline" size="sm">
					<Link href={`/biaya-admin/${event.id}`}>
						Detail
						<ArrowRight className="w-4 h-4 ml-2" />
					</Link>
				</Button>
			);
		},
	},
];
