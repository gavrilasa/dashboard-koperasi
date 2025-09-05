// features/bagi-hasil/data.ts

import { PrismaClient } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

const prisma = new PrismaClient();

// features/bagi-hasil/data.ts

const ITEMS_PER_PAGE = 15;

// Define a new type for the event data that will be sent to the client
export type SafeProfitSharingEvent = {
	id: string;
	executedAt: Date;
	totalAmountShared: number;
	numberOfRecipients: number;
	amountPerRecipient: number;
	remainderAmount: number;
	mainAccountDebitTxId: string;
};

export async function fetchProfitSharingEvents(
	query: string,
	currentPage: number
): Promise<SafeProfitSharingEvent[]> {
	// Return the safe type
	noStore();
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;
	const numericQuery = query ? Number(query) : NaN;

	try {
		const events = await prisma.profitSharingEvent.findMany({
			where: {
				...(!isNaN(numericQuery) && {
					totalAmountShared: {
						equals: numericQuery,
					},
				}),
			},
			orderBy: {
				executedAt: "desc",
			},
			take: ITEMS_PER_PAGE,
			skip: offset,
		});

		// 👇 Convert Decimal fields to number before returning
		return events.map((event) => ({
			...event,
			totalAmountShared: event.totalAmountShared.toNumber(),
			amountPerRecipient: event.amountPerRecipient.toNumber(),
			remainderAmount: event.remainderAmount.toNumber(),
		}));
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil riwayat bagi hasil.");
	}
}

// ... (fetchProfitSharingPages and other functions remain the same)
export async function fetchProfitSharingPages(query: string): Promise<number> {
	noStore();
	const numericQuery = query ? Number(query) : NaN;

	try {
		const count = await prisma.profitSharingEvent.count({
			where: {
				...(!isNaN(numericQuery) && {
					totalAmountShared: {
						equals: numericQuery,
					},
				}),
			},
		});
		return Math.ceil(count / ITEMS_PER_PAGE);
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung total halaman bagi hasil.");
	}
}

export async function fetchProfitSharingEventDetails(eventId: string) {
	noStore();
	try {
		const eventDetails = await prisma.profitSharingEvent.findUnique({
			where: { id: eventId },
			include: {
				recipientTransactions: {
					include: {
						customer: {
							select: {
								id: true,
								name: true,
								accountNumber: true,
							},
						},
					},
					orderBy: {
						customer: {
							name: "asc",
						},
					},
				},
			},
		});
		return eventDetails;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil detail event bagi hasil.");
	}
}

export async function getActiveCustomersCount(): Promise<number> {
	noStore();
	try {
		const count = await prisma.customer.count({
			where: { status: "ACTIVE" },
		});
		return count;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung jumlah nasabah aktif.");
	}
}
