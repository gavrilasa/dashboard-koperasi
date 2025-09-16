import { PrismaClient, MainAccountTransaction } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 15;

export async function getMainAccountBalance(): Promise<number> {
	noStore();
	try {
		let account = await prisma.mainAccount.findFirst();
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

export async function getMainAccountTransactions(
	currentPage: number
): Promise<MainAccountTransaction[]> {
	noStore();
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;
	try {
		const transactions = await prisma.mainAccountTransaction.findMany({
			where: {
				source: {
					notIn: ["FROM_CUSTOMER_DEPOSIT", "FROM_CUSTOMER_WITHDRAWAL"], // Filter diterapkan di sini
				},
			},
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

export async function getMainAccountTransactionPages(): Promise<number> {
	noStore();
	try {
		const count = await prisma.mainAccountTransaction.count({
			where: {
				source: {
					notIn: ["FROM_CUSTOMER_DEPOSIT", "FROM_CUSTOMER_WITHDRAWAL"], // Filter diterapkan di sini
				},
			},
		});
		const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
		return totalPages;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung halaman transaksi rekening induk.");
	}
}
