import { PrismaClient } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import type { SafeAdminFeeEvent } from "./types";
import { ITEMS_PER_PAGE_GENERAL } from "@/lib/constants";

const prisma = new PrismaClient();

export async function fetchAdminFeeEvents(
	query: string,
	currentPage: number
): Promise<SafeAdminFeeEvent[]> {
	noStore();
	const offset = (currentPage - 1) * ITEMS_PER_PAGE_GENERAL;

	try {
		const events = await prisma.adminFeeEvent.findMany({
			where: {
				description: {
					contains: query,
					mode: "insensitive",
				},
			},
			orderBy: {
				executedAt: "desc",
			},
			take: ITEMS_PER_PAGE_GENERAL,
			skip: offset,
		});

		return events.map((event) => ({
			...event,
			totalAmountCollected: event.totalAmountCollected.toNumber(),
			amountPerCustomer: event.amountPerCustomer.toNumber(),
		}));
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil riwayat biaya administrasi.");
	}
}

export async function fetchAdminFeePages(query: string): Promise<number> {
	noStore();
	try {
		const count = await prisma.adminFeeEvent.count({
			where: {
				description: {
					contains: query,
					mode: "insensitive",
				},
			},
		});
		return Math.ceil(count / ITEMS_PER_PAGE_GENERAL);
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error(
			"Gagal menghitung total halaman riwayat biaya administrasi."
		);
	}
}

export async function fetchAdminFeeEventDetails(eventId: string) {
	noStore();
	try {
		const eventDetails = await prisma.adminFeeEvent.findUnique({
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
		throw new Error("Gagal mengambil detail event biaya administrasi.");
	}
}
