// features/bagi-hasil/data.ts

import { PrismaClient, ProfitSharingEvent } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 15;

/**
 * Mengambil daftar riwayat event bagi hasil dari database dengan filter dan paginasi.
 * @param query - String untuk mencari berdasarkan jumlah total (dikonversi ke angka).
 * @param currentPage - Halaman saat ini untuk paginasi.
 * @param dateRange - Opsional, objek dengan tanggal 'from' dan 'to' untuk filter.
 * @returns Array dari event bagi hasil yang cocok.
 */
export async function fetchProfitSharingEvents(
	query: string,
	currentPage: number,
	dateRange?: { from?: Date; to?: Date }
) {
	noStore(); // Mencegah caching data di sisi server
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;
	const numericQuery = Number(query);

	try {
		const events = await prisma.profitSharingEvent.findMany({
			where: {
				AND: [
					{
						// Filter berdasarkan rentang tanggal jika disediakan
						executedAt: {
							gte: dateRange?.from, // gte: greater than or equal
							lte: dateRange?.to, // lte: less than or equal
						},
					},
					{
						// Filter berdasarkan query pencarian jika query adalah angka yang valid
						...(isNaN(numericQuery)
							? {}
							: {
									totalAmountShared: {
										equals: numericQuery,
									},
							  }),
					},
				],
			},
			orderBy: {
				executedAt: "desc", // Tampilkan yang terbaru di atas
			},
			take: ITEMS_PER_PAGE,
			skip: offset,
		});

		return events;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil riwayat bagi hasil.");
	}
}

/**
 * Menghitung total halaman untuk riwayat bagi hasil berdasarkan filter.
 * @param query - String pencarian (jumlah total).
 * @param dateRange - Opsional, objek dengan tanggal 'from' dan 'to'.
 * @returns Jumlah total halaman.
 */
export async function fetchProfitSharingPages(
	query: string,
	dateRange?: { from?: Date; to?: Date }
): Promise<number> {
	noStore();
	const numericQuery = Number(query);

	try {
		const count = await prisma.profitSharingEvent.count({
			where: {
				AND: [
					{
						executedAt: {
							gte: dateRange?.from,
							lte: dateRange?.to,
						},
					},
					{
						...(isNaN(numericQuery)
							? {}
							: {
									totalAmountShared: {
										equals: numericQuery,
									},
							  }),
					},
				],
			},
		});

		return Math.ceil(count / ITEMS_PER_PAGE);
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung total halaman bagi hasil.");
	}
}

/**
 * Mengambil detail lengkap dari satu event bagi hasil, termasuk daftar nasabah penerima.
 * @param eventId - ID dari event bagi hasil.
 * @returns Objek detail event atau null jika tidak ditemukan.
 */
export async function fetchProfitSharingEventDetails(eventId: string) {
	noStore();
	try {
		const eventDetails = await prisma.profitSharingEvent.findUnique({
			where: { id: eventId },
			include: {
				// Mengambil semua transaksi kredit yang terkait dengan event ini
				recipientTransactions: {
					include: {
						// Untuk setiap transaksi, ambil juga data nasabahnya
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
							name: "asc", // Urutkan daftar penerima berdasarkan nama
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

/**
 * Fungsi pembantu untuk pratinjau yang hanya menghitung jumlah nasabah aktif.
 * Ini mencegah pengambilan data yang tidak perlu sebelum eksekusi.
 * @returns Jumlah nasabah dengan status 'ACTIVE'.
 */
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
