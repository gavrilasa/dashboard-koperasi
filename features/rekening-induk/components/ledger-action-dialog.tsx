// features/rekening-induk/components/ledger-action-dialog.tsx

"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { LedgerActionForm } from "./ledger-action-form";

interface LedgerActionDialogProps {
	type: "deposit" | "withdraw";
	children: React.ReactNode; // Trigger button
}

export function LedgerActionDialog({
	type,
	children,
}: LedgerActionDialogProps) {
	const [isOpen, setIsOpen] = useState(false);

	const title =
		type === "deposit"
			? "Top Up Saldo Rekening Induk"
			: "Tarik Saldo Rekening Induk";
	const description =
		type === "deposit"
			? "Masukkan jumlah dan deskripsi untuk menambah saldo operasional."
			: "Masukkan jumlah dan deskripsi untuk menarik dana dari rekening operasional.";

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<LedgerActionForm type={type} onSuccess={() => setIsOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
