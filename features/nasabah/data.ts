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
