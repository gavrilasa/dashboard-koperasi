export type ActionState = {
	status: "success" | "error" | "validation_error";
	message: string | null;
	errors?: {
		[key: string]: string[] | undefined;
	};
};

export interface LedgerActionFormProps {
	type: "deposit" | "withdraw";
	onSuccess: () => void;
}

export interface LedgerActionDialogProps {
	type: "deposit" | "withdraw";
	children: React.ReactNode;
}
