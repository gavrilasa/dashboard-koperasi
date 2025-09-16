import { Customer } from "@prisma/client";

export type PreviewData = {
	amountPerCustomer: number;
	description: string;
	customerCount: number;
	totalAmountCollected: number;
	customersToDeactivate: number;
};

export interface AdminFeeConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	previewData: PreviewData;
}

export type SafeAdminFeeEvent = {
	id: string;
	executedAt: Date;
	totalAmountCollected: number;
	numberOfAffectedCustomers: number;
	amountPerCustomer: number;
	description: string;
	mainAccountCreditTxId: string;
};

export interface AdminFeeHistoryProps {
	query: string;
	currentPage: number;
}

export type SafeAdminFeeSummary = {
	executedAt: Date;
	totalAmountCollected: number;
	numberOfAffectedCustomers: number;
	amountPerCustomer: number;
};

export interface EventSummaryCardProps {
	event: SafeAdminFeeSummary;
}

export type AffectedCustomerData = Pick<
	Customer,
	"id" | "name" | "accountNumber"
> & {
	amountCharged: number;
};
