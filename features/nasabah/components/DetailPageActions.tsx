"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, ArrowDownUp } from "lucide-react";
import type { Customer } from "../types";
import { CustomerProvider } from "./CustomerContext";
import { DepositForm } from "./DepositForm";
import { WithdrawForm } from "./WithdrawForm";
import { TransferForm } from "./TransferForm";

type DialogAction = "deposit" | "withdraw" | "transfer" | null;

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

export default function DetailPageActions({
	customer,
}: {
	customer: Customer;
}) {
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
				<Button
					onClick={() => handleActionClick("deposit")}
					className="cursor-pointer"
				>
					<ArrowUpCircle className="w-4 h-4 mr-2" /> Simpan Tunai
				</Button>
				<Button
					variant="outline"
					onClick={() => handleActionClick("withdraw")}
					className="cursor-pointer"
				>
					<ArrowDownCircle className="w-4 h-4 mr-2" /> Tarik Tunai
				</Button>
				<Button
					variant="outline"
					onClick={() => handleActionClick("transfer")}
					className="cursor-pointer"
				>
					<ArrowDownUp className="w-4 h-4 mr-2" /> Transfer
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
