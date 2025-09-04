// features/rekening-induk/data.ts

import { PrismaClient, MainAccountTransaction } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 15;

/**
 * Mengambil saldo terkini dari rekening induk koperasi.
 * @returns Angka saldo rekening induk.
 */
export async function getMainAccountBalance(): Promise<number> {
	noStore();
	try {
		let account = await prisma.mainAccount.findFirst();
		// Jika rekening belum ada, buat satu secara otomatis
		if (!account) {
			account = await prisma.mainAccount.create({
				data: { name: "Kas Operasional Koperasi", balance: 0 },
			});
		}
		return account.balance.toNumber();
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil saldo rekening induk.");
	}
}

/**
 * Mengambil riwayat transaksi dari rekening induk.
 * @param currentPage - Halaman saat ini untuk paginasi.
 * @returns Array dari transaksi rekening induk.
 */
export async function getMainAccountTransactions(
	currentPage: number
): Promise<MainAccountTransaction[]> {
	noStore();
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;
	try {
		const transactions = await prisma.mainAccountTransaction.findMany({
			orderBy: {
				createdAt: "desc",
			},
			take: ITEMS_PER_PAGE,
			skip: offset,
		});
		return transactions;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil transaksi rekening induk.");
	}
}

/**
 * Menghitung total halaman untuk transaksi rekening induk.
 * @returns Jumlah total halaman.
 */
export async function getMainAccountTransactionPages(): Promise<number> {
	noStore();
	try {
		const count = await prisma.mainAccountTransaction.count();
		const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
		return totalPages;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung halaman transaksi rekening induk.");
	}
}
