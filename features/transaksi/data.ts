// features/transaksi/data.ts

import { PrismaClient, Transaction, Customer } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

// Tipe kustom untuk menggabungkan data transaksi dengan data nasabah
export type TransactionWithCustomer = Transaction & {
	customer: Pick<Customer, "name">;
};

/**
 * Mengambil daftar transaksi dari database dengan filter dan paginasi.
 * @param query - String untuk mencari berdasarkan ID transaksi atau nama nasabah.
 * @param currentPage - Halaman saat ini untuk paginasi.
 * @param dateRange - Opsional, objek dengan tanggal 'from' dan 'to' untuk filter.
 * @returns Array dari transaksi yang cocok.
 */
export async function fetchFilteredTransactions(
	query: string,
	currentPage: number,
	dateRange?: { from?: Date; to?: Date }
): Promise<TransactionWithCustomer[]> {
	noStore();
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;

	try {
		const transactions = await prisma.transaction.findMany({
			where: {
				AND: [
					{
						// Filter berdasarkan query pencarian
						OR: [
							{
								id: {
									contains: query,
									mode: "insensitive",
								},
							},
							{
								customer: {
									name: {
										contains: query,
										mode: "insensitive",
									},
								},
							},
						],
					},
					{
						// Filter berdasarkan rentang tanggal jika ada
						createdAt: {
							gte: dateRange?.from, // gte: greater than or equal
							lte: dateRange?.to, // lte: less than or equal
						},
					},
				],
			},
			include: {
				// Sertakan nama nasabah dari relasi
				customer: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc", // Tampilkan yang terbaru di atas
			},
			take: ITEMS_PER_PAGE,
			skip: offset,
		});

		// Mengembalikan data transaksi yang telah digabungkan
		return transactions;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil data transaksi.");
	}
}

/**
 * Menghitung total halaman transaksi berdasarkan filter yang diberikan.
 * @param query - String pencarian (ID transaksi atau nama nasabah).
 * @param dateRange - Opsional, objek dengan tanggal 'from' dan 'to' untuk filter.
 * @returns Jumlah total halaman.
 */
export async function fetchTransactionPages(
	query: string,
	dateRange?: { from?: Date; to?: Date }
): Promise<number> {
	noStore();
	try {
		const count = await prisma.transaction.count({
			where: {
				AND: [
					{
						OR: [
							{
								id: {
									contains: query,
									mode: "insensitive",
								},
							},
							{
								customer: {
									name: {
										contains: query,
										mode: "insensitive",
									},
								},
							},
						],
					},
					{
						createdAt: {
							gte: dateRange?.from,
							lte: dateRange?.to,
						},
					},
				],
			},
		});

		const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
		return totalPages;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung total halaman transaksi.");
	}
}
