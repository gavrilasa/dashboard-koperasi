import { Customer } from "@prisma/client";

export interface SafeEventSummary {
	executedAt: Date;
	totalAmountShared: number;
	numberOfRecipients: number;
	amountPerRecipient: number;
}

export interface EventSummaryCardProps {
	event: SafeEventSummary;
}

export type PreviewData = {
	totalAmount: number;
	customerCount: number;
	amountPerRecipient: number;
};

export interface ProfitSharingConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	previewData: PreviewData;
}

export interface ProfitSharingHistoryProps {
	query: string;
	currentPage: number;
}

export type RecipientData = Pick<Customer, "id" | "name" | "accountNumber"> & {
	amountReceived: number;
};

export type SafeProfitSharingEvent = {
	id: string;
	executedAt: Date;
	totalAmountShared: number;
	numberOfRecipients: number;
	amountPerRecipient: number;
	remainderAmount: number;
	mainAccountDebitTxId: string;
};
