// features/nasabah/data.ts

import { PrismaClient, Customer, AccountStatus } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

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
				// Tambahkan filter status jika ada
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

export async function fetchCustomerById(
	id: string
): Promise<SafeCustomer | null> {
	noStore();
	try {
		const customer = await prisma.customer.findUnique({
			where: { id },
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

/**
 * Menghitung saldo awal nasabah sebelum tanggal tertentu.
 * Dihitung dari saldo saat ini dikurangi/ditambah transaksi setelah tanggal tersebut.
 * @param customerId - ID nasabah.
 * @param fromDate - Tanggal mulai periode laporan.
 * @returns Saldo awal nasabah.
 */
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

		// Rumus: Saldo Awal = Saldo Sekarang - (Total Kredit Setelahnya) + (Total Debit Setelahnya)
		const initialBalance = currentBalance - totalKreditAfter + totalDebitAfter;

		return initialBalance;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung saldo awal.");
	}
}

/**
 * Mengambil semua transaksi nasabah dalam rentang tanggal tertentu (tanpa paginasi).
 * @param customerId - ID nasabah.
 * @param dateRange - Objek berisi tanggal 'from' dan 'to'.
 * @returns Array dari semua transaksi yang cocok.
 */
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
