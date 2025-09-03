import { PrismaClient } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

const prisma = new PrismaClient();

const ITEMS_PER_PAGE = 10;

/**
 * Mengambil data nasabah dari database dengan filter pencarian dan paginasi.
 * Mengurutkan berdasarkan status (Aktif lebih dulu) lalu tanggal dibuat.
 */
export async function fetchFilteredCustomers(
	query: string,
	currentPage: number
) {
	noStore(); // Mencegah caching untuk data yang sering berubah
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;

	try {
		const customers = await prisma.customer.findMany({
			where: {
				OR: [
					{ name: { contains: query, mode: "insensitive" } },
					{ accountNumber: { contains: query, mode: "insensitive" } },
				],
			},
			orderBy: [{ status: "asc" }, { createdAt: "desc" }],
			take: ITEMS_PER_PAGE,
			skip: offset,
		});

		return customers;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil data nasabah.");
	}
}

/**
 * Menghitung total jumlah halaman untuk paginasi nasabah berdasarkan query pencarian.
 */
export async function fetchCustomersPages(query: string) {
	noStore();
	try {
		const count = await prisma.customer.count({
			where: {
				OR: [
					{ name: { contains: query, mode: "insensitive" } },
					{ accountNumber: { contains: query, mode: "insensitive" } },
				],
			},
		});

		const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
		return totalPages;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung total halaman nasabah.");
	}
}

// --- FUNGSI TAMBAHAN UNTUK HALAMAN DETAIL ---

/**
 * Mengambil data profil lengkap dari satu nasabah berdasarkan ID.
 * @param id - ID unik nasabah.
 * @returns Objek data nasabah atau null jika tidak ditemukan.
 */
export async function fetchCustomerById(id: string) {
	noStore();
	try {
		const customer = await prisma.customer.findUnique({
			where: { id },
		});
		return customer;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil detail profil nasabah.");
	}
}

/**
 * Mengambil riwayat transaksi untuk satu nasabah dengan paginasi.
 * @param customerId - ID nasabah yang transaksinya ingin diambil.
 * @param currentPage - Halaman saat ini untuk paginasi transaksi.
 * @returns Array dari data transaksi nasabah.
 */
export async function fetchCustomerTransactions(
	customerId: string,
	currentPage: number
) {
	noStore();
	const offset = (currentPage - 1) * ITEMS_PER_PAGE;

	try {
		const transactions = await prisma.transaction.findMany({
			where: { customerId },
			orderBy: { createdAt: "desc" },
			take: ITEMS_PER_PAGE,
			skip: offset,
		});
		return transactions;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil riwayat transaksi nasabah.");
	}
}

/**
 * Menghitung total halaman untuk paginasi riwayat transaksi nasabah.
 * @param customerId - ID nasabah.
 * @returns Total jumlah halaman transaksi.
 */
export async function fetchCustomerTransactionPages(customerId: string) {
	noStore();
	try {
		const count = await prisma.transaction.count({
			where: { customerId },
		});
		const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
		return totalPages;
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal menghitung total halaman transaksi.");
	}
}
