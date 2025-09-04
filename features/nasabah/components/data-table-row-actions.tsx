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
import type { Customer } from "../types";
import { CustomerProvider } from "./CustomerContext";
import { DepositForm } from "./DepositForm";
import { WithdrawForm } from "./WithdrawForm";
import { TransferForm } from "./TransferForm";

type DialogAction = "deposit" | "withdraw" | "transfer" | null;

/**
 * Komponen Dialog Aksi Transaksi yang dinamis.
 * Merender form yang sesuai berdasarkan prop 'action'.
 */
function TransactionDialog({
	action,
	open,
	onOpenChange,
	onSuccess,
}: {
	action: DialogAction;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}) {
	const titles: Record<NonNullable<DialogAction>, string> = {
		deposit: "Simpan Tunai",
		withdraw: "Tarik Tunai",
		transfer: "Transfer Dana",
	};

	const title = action ? titles[action] : "";

	const renderForm = () => {
		switch (action) {
			case "deposit":
				return <DepositForm onSuccess={onSuccess} />;
			case "withdraw":
				return <WithdrawForm onSuccess={onSuccess} />;
			case "transfer":
				return <TransferForm onSuccess={onSuccess} />;
			default:
				return null;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="py-4">{renderForm()}</div>
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

	const handleCloseDialog = () => {
		setDialogAction(null);
	};

	return (
		<TooltipProvider delayDuration={0}>
			<div className="flex items-center justify-center gap-1">
				{/* Tombol Lihat Detail */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button asChild variant="ghost" size="icon">
							<Link href={`/nasabah/${customer.id}`}>
								<Eye className="w-4 h-4 text-blue-500" />
								<span className="sr-only">Lihat Detail</span>
							</Link>
						</Button>
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

				{/*
          Dialog Transaksi dibungkus dengan CustomerProvider.
          Ini membuat data 'customer' tersedia untuk form apapun yang dirender di dalamnya.
        */}
				<CustomerProvider customer={customer}>
					<TransactionDialog
						action={dialogAction}
						open={!!dialogAction}
						onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
						onSuccess={handleCloseDialog}
					/>
				</CustomerProvider>
			</div>
		</TooltipProvider>
	);
}
