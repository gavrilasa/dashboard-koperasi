// features/bagi-hasil/actions.ts

"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/utils";

// Menggunakan tipe State yang serupa dengan fitur nasabah untuk konsistensi
import type { ActionState } from "./types";

const prisma = new PrismaClient();

// Skema untuk validasi input dari form
const ProfitSharingSchema = z.object({
	idempotencyKey: z.string().uuid(),
	totalAmount: z.coerce
		.number()
		.positive({ message: "Jumlah bagi hasil harus lebih dari nol." }),
});

/**
 * Server action untuk mengeksekusi proses bagi hasil.
 * Mendebit rekening induk dan mendistribusikan dana secara merata ke semua nasabah aktif.
 * @param prevState - State sebelumnya dari form.
 * @param formData - Data dari form yang dikirim oleh klien.
 * @returns State baru yang berisi pesan sukses atau error.
 */
export async function executeProfitSharing(
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	// 1. Validasi Input
	const validatedFields = ProfitSharingSchema.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			status: "validation_error", // FIX: Added status
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Gagal memproses. Data yang dimasukkan tidak valid.",
		};
	}

	const { totalAmount, idempotencyKey } = validatedFields.data;

	try {
		// Menggunakan transaksi Prisma untuk memastikan semua operasi berhasil atau tidak sama sekali (rollback)
		await prisma.$transaction(async (tx) => {
			// 2. Validasi Idempotensi
			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) {
				// Jika kunci sudah ada, anggap sukses tapi tidak melakukan apa-apa
				// untuk mencegah eksekusi ganda.
				throw new Error("DUPLICATE_EXECUTION");
			}
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			// 3. Validasi Saldo Rekening Induk
			const mainAccount = await tx.mainAccount.findFirst();
			if (!mainAccount || Number(mainAccount.balance) < totalAmount) {
				throw new Error("Saldo rekening induk tidak mencukupi.");
			}

			// 4. Ambil Semua Nasabah Aktif
			const activeCustomers = await tx.customer.findMany({
				where: { status: "ACTIVE" },
			});

			if (activeCustomers.length === 0) {
				throw new Error("Tidak ada nasabah aktif yang ditemukan.");
			}

			// 5. Perhitungan
			const numberOfRecipients = activeCustomers.length;
			// Pembulatan ke bawah untuk memastikan tidak melebihi total
			const amountPerRecipient =
				Math.floor((totalAmount * 100) / numberOfRecipients) / 100;
			const totalDistributed = amountPerRecipient * numberOfRecipients;
			const remainderAmount = totalAmount - totalDistributed;

			// 6. Eksekusi Transaksi
			// a. Debit Rekening Induk
			await tx.mainAccount.update({
				where: { id: mainAccount.id },
				data: { balance: { decrement: totalAmount } },
			});

			const mainAccountTx = await tx.mainAccountTransaction.create({
				data: {
					mainAccountId: mainAccount.id,
					amount: totalAmount,
					type: "DEBIT",
					description: `Bagi Hasil - ${formatDate(new Date())}`,
					notes: `Total didistribusikan: ${totalDistributed}. Sisa pembulatan: ${remainderAmount} dikembalikan.`,
				},
			});

			// b. Buat Event Bagi Hasil
			const profitSharingEvent = await tx.profitSharingEvent.create({
				data: {
					totalAmountShared: totalAmount,
					numberOfRecipients,
					amountPerRecipient,
					remainderAmount,
					mainAccountDebitTxId: mainAccountTx.id,
				},
			});

			// c. Kredit ke setiap nasabah
			for (const customer of activeCustomers) {
				// Update saldo nasabah
				await tx.customer.update({
					where: { id: customer.id },
					data: { balance: { increment: amountPerRecipient } },
				});

				// Buat record transaksi untuk nasabah
				await tx.transaction.create({
					data: {
						customerId: customer.id,
						amount: amountPerRecipient,
						type: "KREDIT",
						description: `Bagi Hasil - ${formatDate(new Date())}`,
						profitSharingEventId: profitSharingEvent.id, // Menghubungkan ke event
					},
				});
			}
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			if (error.message === "DUPLICATE_EXECUTION") {
				return {
					status: "success", // FIX: Added status
					message: "Proses berhasil. Permintaan duplikat diabaikan.",
				};
			}
			// Mengembalikan pesan error yang spesifik dari validasi atau kegagalan transaksi
			return { status: "error", message: error.message }; // FIX: Added status
		}
		// Menangkap error umum dari database
		return {
			status: "error", // FIX: Added status
			message: "Database Error: Gagal mengeksekusi bagi hasil.",
		};
	}

	// Revalidasi path untuk memperbarui cache di halaman terkait
	revalidatePath("/bagi-hasil");
	revalidatePath("/rekening-induk");

	return {
		status: "success", // FIX: Added status
		message: "Proses bagi hasil berhasil dieksekusi.",
	};
}
