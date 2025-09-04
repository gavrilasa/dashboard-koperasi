// features/nasabah/components/data-table-row-actions.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Eye, ArrowDownUp, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Customer } from "../types";

type DialogAction = "deposit" | "withdraw" | "transfer" | null;

/**
 * Komponen Dialog Aksi Transaksi.
 */
function TransactionDialog({
	customer,
	action,
	open,
	onOpenChange,
}: {
	customer: Customer;
	action: DialogAction;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const titles: Record<NonNullable<DialogAction>, string> = {
		deposit: "Simpan Tunai",
		withdraw: "Tarik Tunai",
		transfer: "Transfer Dana",
	};

	const title = action ? titles[action] : "";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{`${title} untuk ${customer.name}`}</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<p>Form untuk {title.toLowerCase()} akan ditampilkan di sini.</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Komponen untuk menampilkan aksi cepat di setiap baris tabel.
 */
export function CustomerTableRowActions({ customer }: { customer: Customer }) {
	const [dialogAction, setDialogAction] = useState<DialogAction>(null);

	const handleActionClick = (action: DialogAction) => {
		setDialogAction(action);
	};

	return (
		<TooltipProvider delayDuration={0}>
			<div className="flex items-center justify-center gap-1">
				{/* Tombol Lihat Detail */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Link href={`/nasabah/${customer.id}`}>
							<Button variant="ghost" size="icon">
								<Eye className="w-4 h-4 text-blue-500" />
								<span className="sr-only">Lihat Detail</span>
							</Button>
						</Link>
					</TooltipTrigger>
					<TooltipContent>
						<p>Lihat Detail</p>
					</TooltipContent>
				</Tooltip>

				{/* Tombol Simpan Tunai */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleActionClick("deposit")}
						>
							<ArrowUpCircle className="w-4 h-4 text-green-500 fill-green-100" />
							<span className="sr-only">Simpan Tunai</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Simpan Tunai</p>
					</TooltipContent>
				</Tooltip>

				{/* Tombol Tarik Tunai */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleActionClick("withdraw")}
						>
							<ArrowDownCircle className="w-4 h-4 text-red-500 fill-red-100" />
							<span className="sr-only">Tarik Tunai</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Tarik Tunai</p>
					</TooltipContent>
				</Tooltip>

				{/* Tombol Transfer */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleActionClick("transfer")}
						>
							<ArrowDownUp className="w-4 h-4 text-yellow-500" />
							<span className="sr-only">Transfer</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Transfer</p>
					</TooltipContent>
				</Tooltip>

				{/* Dialog Transaksi (hanya satu instance yang dirender) */}
				<TransactionDialog
					customer={customer}
					action={dialogAction}
					open={!!dialogAction}
					onOpenChange={(isOpen) => !isOpen && setDialogAction(null)}
				/>
			</div>
		</TooltipProvider>
	);
}
