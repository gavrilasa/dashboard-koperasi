import { PrismaClient, Prisma } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { CombinedTransaction } from "./types";
import { subDays } from "date-fns";

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

export async function fetchCombinedTransactions(
	query: string,
	currentPage: number,
	dateRange?: { from?: Date; to?: Date }
): Promise<{ transactions: CombinedTransaction[]; totalPages: number }> {
	noStore();
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;

	const customerWhere: Prisma.TransactionWhereInput = {
		adminFeeEventId: null,
		profitSharingEventId: null,
		createdAt: { gte: dateRange?.from, lte: dateRange?.to },
	};

	const mainAccountWhere: Prisma.MainAccountTransactionWhereInput = {
		source: {
			notIn: ["FROM_CUSTOMER_DEPOSIT", "FROM_CUSTOMER_WITHDRAWAL"],
		},
		createdAt: { gte: dateRange?.from, lte: dateRange?.to },
	};

	if (query) {
		customerWhere.OR = [
			{ receiptNumber: { contains: query, mode: "insensitive" } },
			{ customer: { name: { contains: query, mode: "insensitive" } } },
		];
		mainAccountWhere.OR = [
			{ receiptNumber: { contains: query, mode: "insensitive" } },
			{ description: { contains: query, mode: "insensitive" } },
		];
	}

	try {
		const customerTransactions = await prisma.transaction.findMany({
			where: customerWhere,
			include: { customer: { select: { name: true } } },
		});

		const mainAccountTransactions =
			await prisma.mainAccountTransaction.findMany({
				where: mainAccountWhere,
			});

		const combined: CombinedTransaction[] = [
			...customerTransactions.map((tx) => ({
				createdAt: tx.createdAt,
				receiptNumber: tx.receiptNumber,
				customerName: tx.customer.name,
				description: tx.description,
				type: tx.type,
				amount: tx.amount.toNumber(),
			})),
			...mainAccountTransactions.map((tx) => ({
				createdAt: tx.createdAt,
				receiptNumber: tx.receiptNumber,
				customerName: "Koperasi",
				description: tx.description,
				type: tx.type,
				amount: tx.amount.toNumber(),
			})),
		];

		combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
		const totalPages = Math.ceil(combined.length / ITEMS_PER_PAGE);
		const paginatedTransactions = combined.slice(
			offset,
			offset + ITEMS_PER_PAGE
		);

		return { transactions: paginatedTransactions, totalPages };
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil data transaksi gabungan.");
	}
}

export async function fetchAllCombinedTransactionsForPrint(dateRange?: {
	from?: Date;
	to?: Date;
}): Promise<CombinedTransaction[]> {
	noStore();
	try {
		const customerTransactions = await prisma.transaction.findMany({
			where: {
				adminFeeEventId: null,
				profitSharingEventId: null,
				createdAt: { gte: dateRange?.from, lte: dateRange?.to },
			},
			include: { customer: { select: { name: true } } },
		});

		const mainAccountTransactions =
			await prisma.mainAccountTransaction.findMany({
				where: {
					source: {
						notIn: ["FROM_CUSTOMER_DEPOSIT", "FROM_CUSTOMER_WITHDRAWAL"],
					},
					createdAt: { gte: dateRange?.from, lte: dateRange?.to },
				},
			});

		const combined: CombinedTransaction[] = [
			...customerTransactions.map((tx) => ({
				createdAt: tx.createdAt,
				receiptNumber: tx.receiptNumber,
				customerName: tx.customer.name,
				description: tx.description,
				type: tx.type,
				amount: tx.amount.toNumber(),
			})),
			...mainAccountTransactions.map((tx) => ({
				createdAt: tx.createdAt,
				receiptNumber: tx.receiptNumber,
				customerName: "Koperasi",
				description: tx.description,
				type: tx.type,
				amount: tx.amount.toNumber(),
			})),
		];

		combined.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
		return combined;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil semua data transaksi untuk dicetak.");
	}
}

export async function calculateOpeningBalance(
	untilDate: Date
): Promise<number> {
	noStore();
	try {
		const dayBefore = subDays(untilDate, 1);

		const lastSnapshot = await prisma.dailyBalanceSnapshot.findFirst({
			where: {
				date: { lte: dayBefore },
			},
			orderBy: {
				date: "desc",
			},
		});

		if (lastSnapshot) {
			return lastSnapshot.balance.toNumber();
		}

		// Fallback jika tidak ada snapshot
		const totalCredit = await prisma.mainAccountTransaction.aggregate({
			_sum: { amount: true },
			where: { type: "KREDIT", createdAt: { lt: untilDate } },
		});
		const totalDebit = await prisma.mainAccountTransaction.aggregate({
			_sum: { amount: true },
			where: { type: "DEBIT", createdAt: { lt: untilDate } },
		});

		return (
			(totalCredit._sum.amount?.toNumber() ?? 0) -
			(totalDebit._sum.amount?.toNumber() ?? 0)
		);
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung saldo awal.");
	}
}
