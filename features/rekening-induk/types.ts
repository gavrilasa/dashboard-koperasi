export interface LedgerActionFormProps {
	type: "deposit" | "withdraw";
	onSuccess: () => void;
}

export interface LedgerActionDialogProps {
	type: "deposit" | "withdraw";
	children: React.ReactNode;
}
