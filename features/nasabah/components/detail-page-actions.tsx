// features/nasabah/components/detail-page-actions.tsx

"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import type { Customer } from "../types";
import { CustomerProvider } from "./CustomerContext";
import { DepositForm } from "./DepositForm";
import { WithdrawForm } from "./WithdrawForm";

type DialogAction = "deposit" | "withdraw" | null;

// Komponen Dialog dinamis, sama seperti yang ada di row-actions
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
	};

	const title = action ? titles[action] : "";

	const renderForm = () => {
		switch (action) {
			case "deposit":
				return <DepositForm onSuccess={onSuccess} />;
			case "withdraw":
				return <WithdrawForm onSuccess={onSuccess} />;
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

// Komponen utama yang berisi tombol dan logika dialog
export function DetailPageActions({ customer }: { customer: Customer }) {
	const [dialogAction, setDialogAction] = useState<DialogAction>(null);

	const handleActionClick = (action: DialogAction) => {
		setDialogAction(action);
	};

	const handleCloseDialog = () => {
		setDialogAction(null);
	};

	return (
		<>
			<div className="flex gap-2 mt-4">
				<Button onClick={() => handleActionClick("deposit")}>
					<ArrowUpCircle className="w-4 h-4 mr-2" /> Simpan Tunai
				</Button>
				<Button variant="outline" onClick={() => handleActionClick("withdraw")}>
					<ArrowDownCircle className="w-4 h-4 mr-2" /> Tarik Tunai
				</Button>
			</div>

			<CustomerProvider customer={customer}>
				<TransactionDialog
					action={dialogAction}
					open={!!dialogAction}
					onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
					onSuccess={handleCloseDialog}
				/>
			</CustomerProvider>
		</>
	);
}
