import { ColumnDef } from "@tanstack/react-table";
import { Transaction, Customer } from "@prisma/client";

export interface TransactionDataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export type TransactionWithCustomer = Omit<Transaction, "amount"> & {
	amount: number;
	customer: Pick<Customer, "name">;
};

export type CombinedTransaction = {
	createdAt: Date;
	receiptNumber: string;
	customerName: string;
	description: string;
	type: string;
	amount: number;
};
