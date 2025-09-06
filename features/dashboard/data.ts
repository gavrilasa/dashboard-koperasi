import { PrismaClient } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { isSameDay, startOfDay, subDays } from "date-fns";
import { DashboardStats, ChartDataPoint } from "./types";

const prisma = new PrismaClient();

export async function getDashboardStats(range: {
	from: Date;
	to: Date;
}): Promise<DashboardStats> {
	noStore();
	try {
		const [balanceSnapshot, activeCustomerCount, transactionVolume] =
			await Promise.all([
				prisma.dailyBalanceSnapshot.findFirst({
					where: { date: { lte: range.to } },
					orderBy: { date: "desc" },
				}),
				prisma.customer.count({ where: { status: "ACTIVE" } }),
				prisma.transaction.aggregate({
					_sum: { amount: true },
					where: { createdAt: { gte: range.from, lte: range.to } },
				}),
			]);
		return {
			mainAccountBalance: balanceSnapshot?.balance.toNumber() ?? 0,
			activeCustomerCount: activeCustomerCount ?? 0,
			totalTransactionVolume: transactionVolume._sum.amount?.toNumber() ?? 0,
		};
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil data statistik dashboard.");
	}
}

export async function getTransactionChartData(range: {
	from: Date;
	to: Date;
}): Promise<ChartDataPoint[]> {
	noStore();
	try {
		const diffDays =
			(range.to.getTime() - range.from.getTime()) / (1000 * 3600 * 24);
		const timeZone = "Asia/Jakarta";

		let query;
		if (diffDays <= 2) {
			query = prisma.$queryRaw<
				{ label: string; value: number }[]
			>`SELECT TO_CHAR("createdAt" AT TIME ZONE ${timeZone}, 'HH24:00') as label, COUNT(id)::int as value FROM "Transaction" WHERE "createdAt" BETWEEN ${range.from} AND ${range.to} GROUP BY label ORDER BY label ASC;`;
		} else if (diffDays <= 90) {
			query = prisma.$queryRaw<
				{ label: string; value: number }[]
			>`SELECT TO_CHAR("createdAt" AT TIME ZONE ${timeZone}, 'YYYY-MM-DD') as label, COUNT(id)::int as value FROM "Transaction" WHERE "createdAt" BETWEEN ${range.from} AND ${range.to} GROUP BY label ORDER BY label ASC;`;
		} else {
			query = prisma.$queryRaw<
				{ label: string; value: number }[]
			>`SELECT TO_CHAR("createdAt" AT TIME ZONE ${timeZone}, 'YYYY-MM') as label, COUNT(id)::int as value FROM "Transaction" WHERE "createdAt" BETWEEN ${range.from} AND ${range.to} GROUP BY label ORDER BY label ASC;`;
		}
		return await query;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil data untuk grafik transaksi.");
	}
}

export async function getMainAccountChartData(range: {
	from: Date;
	to: Date;
}): Promise<ChartDataPoint[]> {
	noStore();
	try {
		if (isSameDay(range.from, range.to)) {
			const previousDay = subDays(startOfDay(range.from), 1);
			const previousDaySnapshot = await prisma.dailyBalanceSnapshot.findUnique({
				where: { date: previousDay },
			});
			let runningBalance = previousDaySnapshot?.balance.toNumber() ?? 0;

			const transactionsToday = await prisma.mainAccountTransaction.findMany({
				where: { createdAt: { gte: range.from, lte: range.to } },
				orderBy: { createdAt: "asc" },
			});

			const chartData: ChartDataPoint[] = [
				{
					label: "00:00",
					value: runningBalance,
				},
			];

			for (const tx of transactionsToday) {
				if (tx.type === "KREDIT") {
					runningBalance += tx.amount.toNumber();
				} else {
					runningBalance -= tx.amount.toNumber();
				}
				chartData.push({
					label: tx.createdAt.toLocaleTimeString("id-ID", {
						hour: "2-digit",
						minute: "2-digit",
						timeZone: "Asia/Jakarta",
					}),
					value: runningBalance,
				});
			}
			return chartData;
		} else {
			const snapshots = await prisma.dailyBalanceSnapshot.findMany({
				where: { date: { gte: range.from, lte: range.to } },
				orderBy: { date: "asc" },
			});
			return snapshots.map((snapshot) => ({
				label: new Date(snapshot.date).toLocaleDateString("id-ID", {
					month: "short",
					day: "numeric",
				}),
				value: snapshot.balance.toNumber(),
			}));
		}
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil data untuk grafik rekening induk.");
	}
}
