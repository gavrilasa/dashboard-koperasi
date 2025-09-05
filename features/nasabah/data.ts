// features/nasabah/data.ts

import {
	PrismaClient,
	Customer,
	AccountStatus,
	Attachment,
} from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

// Definisikan tipe baru yang menyertakan relasi lampiran
export type SafeCustomerWithAttachment = Omit<Customer, "balance"> & {
	balance: number;
	ktpAttachment: Attachment | null; // Lampiran bisa jadi null
};

export type SafeCustomer = Omit<Customer, "balance"> & {
	balance: number;
};

export async function fetchFilteredCustomers(
	query: string,
	currentPage: number,
	status?: AccountStatus
): Promise<SafeCustomer[]> {
	noStore();
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;

	try {
		const customers = await prisma.customer.findMany({
			where: {
				status: status ? { equals: status } : undefined,
				OR: [
					{ name: { contains: query, mode: "insensitive" } },
					{ accountNumber: { contains: query, mode: "insensitive" } },
				],
			},
			orderBy: [{ status: "asc" }, { createdAt: "desc" }],
			take: ITEMS_PER_PAGE,
			skip: offset,
		});

		return customers.map((customer) => ({
			...customer,
			balance: customer.balance.toNumber(),
		}));
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil data nasabah.");
	}
}

export async function fetchCustomersPages(query: string) {
	noStore();
	try {
		const count = await prisma.customer.count({
			where: {
				OR: [
					{ name: { contains: query, mode: "insensitive" } },
					{ accountNumber: { contains: query, mode: "insensitive" } },
				],
			},
		});

		const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
		return totalPages;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung total halaman nasabah.");
	}
}

// SOLUSI: Modifikasi fungsi ini untuk menyertakan data lampiran
export async function fetchCustomerById(
	id: string
): Promise<SafeCustomerWithAttachment | null> {
	noStore();
	try {
		const customer = await prisma.customer.findUnique({
			where: { id },
			include: {
				ktpAttachment: true, // Sertakan data dari relasi ktpAttachment
			},
		});

		if (!customer) {
			return null;
		}

		return {
			...customer,
			balance: customer.balance.toNumber(),
		};
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil detail profil nasabah.");
	}
}

export async function fetchCustomerTransactions(
	customerId: string,
	currentPage: number
) {
	noStore();
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;

	try {
		const transactions = await prisma.transaction.findMany({
			where: { customerId },
			orderBy: { createdAt: "desc" },
			take: ITEMS_PER_PAGE,
			skip: offset,
		});
		return transactions;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil riwayat transaksi nasabah.");
	}
}

export async function fetchCustomerTransactionPages(customerId: string) {
	noStore();
	try {
		const count = await prisma.transaction.count({
			where: { customerId },
		});
		const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
		return totalPages;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung total halaman transaksi.");
	}
}

export async function calculateInitialBalance(
	customerId: string,
	fromDate: Date
): Promise<number> {
	noStore();
	try {
		const customer = await prisma.customer.findUniqueOrThrow({
			where: { id: customerId },
			select: { balance: true },
		});

		const transactionsAfter = await prisma.transaction.aggregate({
			_sum: {
				amount: true,
			},
			where: {
				customerId,
				createdAt: {
					gte: fromDate,
				},
				type: "KREDIT",
			},
		});

		const transactionsBefore = await prisma.transaction.aggregate({
			_sum: {
				amount: true,
			},
			where: {
				customerId,
				createdAt: {
					gte: fromDate,
				},
				type: "DEBIT",
			},
		});

		const currentBalance = customer.balance.toNumber();
		const totalKreditAfter = transactionsAfter._sum.amount?.toNumber() || 0;
		const totalDebitAfter = transactionsBefore._sum.amount?.toNumber() || 0;

		const initialBalance = currentBalance - totalKreditAfter + totalDebitAfter;

		return initialBalance;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung saldo awal.");
	}
}

export async function fetchCustomerTransactionsByDateRange(
	customerId: string,
	dateRange: { from: Date; to: Date }
) {
	noStore();
	try {
		const transactions = await prisma.transaction.findMany({
			where: {
				customerId,
				createdAt: {
					gte: dateRange.from,
					lte: dateRange.to,
				},
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		return transactions.map((tx) => ({
			...tx,
			amount: tx.amount.toNumber(),
			type: tx.type as "KREDIT" | "DEBIT",
		}));
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil riwayat transaksi untuk dicetak.");
	}
}
