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
		const [
			balanceSnapshot,
			activeCustomerCount,
			transactionVolume,
			customerTransactionCount, // query baru
			mainAccountTransactionCount, // query baru
		] = await Promise.all([
			prisma.dailyBalanceSnapshot.findFirst({
				where: { date: { lte: range.to } },
				orderBy: { date: "desc" },
			}),
			prisma.customer.count({ where: { status: "ACTIVE" } }),
			prisma.transaction.aggregate({
				_sum: { amount: true },
				where: { createdAt: { gte: range.from, lte: range.to } },
			}),
			// Menghitung jumlah transaksi nasabah
			prisma.transaction.count({
				where: { createdAt: { gte: range.from, lte: range.to } },
			}),
			// Menghitung jumlah transaksi rekening induk
			prisma.mainAccountTransaction.count({
				where: {
					createdAt: { gte: range.from, lte: range.to },
					source: {
						notIn: ["FROM_CUSTOMER_DEPOSIT", "FROM_CUSTOMER_WITHDRAWAL"],
					},
				},
			}),
		]);

		// Menjumlahkan kedua hasil hitungan
		const totalTransactionCount =
			(customerTransactionCount ?? 0) + (mainAccountTransactionCount ?? 0);

		return {
			mainAccountBalance: balanceSnapshot?.balance.toNumber() ?? 0,
			activeCustomerCount: activeCustomerCount ?? 0,
			totalTransactionVolume: transactionVolume._sum.amount?.toNumber() ?? 0,
			totalTransactionCount: totalTransactionCount, // properti baru dikembalikan
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

		const displayTimeZone = "Asia/Jakarta";

		if (diffDays <= 2) {
			const result = await prisma.$queryRaw<
				{ utc_hour: Date; value: number }[]
			>`
        SELECT 
          DATE_TRUNC('hour', "createdAt" AT TIME ZONE 'UTC') as utc_hour, 
          COUNT(id)::int as value 
        FROM "Transaction" 
        WHERE "createdAt" BETWEEN ${range.from} AND ${range.to} 
        GROUP BY utc_hour 
        ORDER BY utc_hour ASC;
      `;

			return result.map((item) => ({
				value: item.value,
				label: new Date(item.utc_hour).toLocaleTimeString("id-ID", {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
					timeZone: displayTimeZone,
				}),
			}));
		} else if (diffDays <= 90) {
			const result = await prisma.$queryRaw<{ utc_day: Date; value: number }[]>`
        SELECT 
          DATE_TRUNC('day', "createdAt" AT TIME ZONE 'UTC')::date as utc_day, 
          COUNT(id)::int as value 
        FROM "Transaction" 
        WHERE "createdAt" BETWEEN ${range.from} AND ${range.to} 
        GROUP BY utc_day 
        ORDER BY utc_day ASC;
      `;

			return result.map((item) => ({
				value: item.value,
				label: new Date(item.utc_day).toLocaleDateString("id-ID", {
					month: "short",
					day: "numeric",
					timeZone: "UTC",
				}),
			}));
		} else {
			const result = await prisma.$queryRaw<
				{ utc_month: Date; value: number }[]
			>`
        SELECT 
          DATE_TRUNC('month', "createdAt" AT TIME ZONE 'UTC')::date as utc_month, 
          COUNT(id)::int as value 
        FROM "Transaction" 
        WHERE "createdAt" BETWEEN ${range.from} AND ${range.to} 
        GROUP BY utc_month 
        ORDER BY utc_month ASC;
      `;

			return result.map((item) => ({
				value: item.value,
				label: new Date(item.utc_month).toLocaleDateString("id-ID", {
					month: "short",
					year: "numeric",
					timeZone: "UTC",
				}),
			}));
		}
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
