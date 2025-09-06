import { PrismaClient } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { TransactionWithCustomer } from "./types";

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

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
			include: {
				customer: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: ITEMS_PER_PAGE,
			skip: offset,
		});

		return transactions.map((tx) => ({
			...tx,
			amount: tx.amount.toNumber(),
		}));
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil data transaksi.");
	}
}

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
