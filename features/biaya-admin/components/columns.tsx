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
			width: "25%",
		},
		cell: ({ row }) => <div>{formatDate(row.getValue("executedAt"))}</div>,
	},
	{
		accessorKey: "description",
		header: "Deskripsi",
		meta: {
			width: "20%",
			truncate: true,
		},
	},
	{
		accessorKey: "totalAmountCollected",
		header: () => <div className="text-center">Total Terkumpul</div>,
		meta: {
			width: "20%",
			align: "center",
		},
		cell: ({ row }) => {
			const total = row.getValue("totalAmountCollected") as number;
			return <div className="font-semibold">{formatCurrency(total)}</div>;
		},
	},
	{
		accessorKey: "numberOfAffectedCustomers",
		header: () => <div className="text-center">Jumlah Nasabah</div>,
		meta: {
			width: "20%",
			align: "center",
		},
		cell: ({ row }) => (
			<div>{row.getValue("numberOfAffectedCustomers")} Nasabah</div>
		),
	},
	{
		id: "actions",
		header: () => <div className="text-center">Aksi</div>,
		meta: {
			width: "15%",
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
