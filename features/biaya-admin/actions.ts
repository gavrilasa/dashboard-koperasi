// File: features/biaya-admin/actions.ts

"use server";

import { z } from "zod";
import { PrismaClient, MainAccountTransactionSource } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./types";
import { unstable_noStore as noStore } from "next/cache";

const prisma = new PrismaClient();

const AdminFeeSchema = z.object({
	idempotencyKey: z.string().uuid(),
	amountPerCustomer: z.coerce
		.number()
		.positive({ message: "Nominal biaya admin harus lebih dari nol." }),
	description: z
		.string()
		.min(3, { message: "Deskripsi wajib diisi." })
		.max(100, { message: "Deskripsi tidak boleh lebih dari 100 karakter." }),
});

async function getMainAccountId(): Promise<string> {
	let account = await prisma.mainAccount.findFirst();
	if (!account) {
		account = await prisma.mainAccount.create({
			data: { name: "Kas Operasional Koperasi", balance: 0 },
		});
	}
	return account.id;
}

export async function executeAdminFee(
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	const validatedFields = AdminFeeSchema.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			status: "validation_error",
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Gagal memproses. Data yang dimasukkan tidak valid.",
		};
	}

	const { amountPerCustomer, description, idempotencyKey } =
		validatedFields.data;
	const mainAccountId = await getMainAccountId();

	try {
		await prisma.$transaction(async (tx) => {
			// 1. Idempotency Check
			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) {
				throw new Error("DUPLICATE_EXECUTION");
			}
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			// 2. Ambil semua nasabah aktif yang saldonya mencukupi
			const affectedCustomers = await tx.customer.findMany({
				where: {
					status: "ACTIVE",
					balance: {
						gte: amountPerCustomer,
					},
				},
			});

			if (affectedCustomers.length === 0) {
				throw new Error("Tidak ada nasabah yang memenuhi kriteria.");
			}

			const numberOfAffectedCustomers = affectedCustomers.length;
			const totalAmountCollected =
				amountPerCustomer * numberOfAffectedCustomers;

			// 3. Buat event biaya admin
			const adminFeeEvent = await tx.adminFeeEvent.create({
				data: {
					totalAmountCollected,
					numberOfAffectedCustomers,
					amountPerCustomer,
					description,
					mainAccountCreditTxId: "", // Placeholder, akan di-update nanti
				},
			});

			// 4. Catat pemasukan ke rekening induk
			const mainAccountTx = await tx.mainAccountTransaction.create({
				data: {
					mainAccountId: mainAccountId,
					amount: totalAmountCollected,
					type: "KREDIT",
					description: `Biaya Admin: ${description}`,
					source: MainAccountTransactionSource.MANUAL_OPERATIONAL, // Ganti jika ada source yang lebih sesuai
				},
			});

			// Update mainAccountCreditTxId di event
			await tx.adminFeeEvent.update({
				where: { id: adminFeeEvent.id },
				data: { mainAccountCreditTxId: mainAccountTx.id },
			});

			// Tambahkan total biaya ke saldo rekening induk
			await tx.mainAccount.update({
				where: { id: mainAccountId },
				data: { balance: { increment: totalAmountCollected } },
			});

			// 5. Buat transaksi debit dan update saldo untuk setiap nasabah
			const customerIdsToDebit = affectedCustomers.map((c) => c.id);

			await tx.customer.updateMany({
				where: { id: { in: customerIdsToDebit } },
				data: {
					balance: {
						decrement: amountPerCustomer,
					},
				},
			});

			await tx.transaction.createMany({
				data: customerIdsToDebit.map((customerId) => ({
					customerId,
					amount: amountPerCustomer,
					type: "DEBIT",
					description: description,
					adminFeeEventId: adminFeeEvent.id,
				})),
			});

			// 6. Update status nasabah yang saldonya di bawah 50.000
			const customersToCheckStatus = await tx.customer.findMany({
				where: {
					id: { in: customerIdsToDebit },
					balance: {
						lt: 50000,
					},
				},
				select: {
					id: true,
				},
			});

			if (customersToCheckStatus.length > 0) {
				const customerIdsToDeactivate = customersToCheckStatus.map((c) => c.id);
				await tx.customer.updateMany({
					where: {
						id: { in: customerIdsToDeactivate },
					},
					data: {
						status: "INACTIVE",
					},
				});
			}
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			if (error.message === "DUPLICATE_EXECUTION") {
				return {
					status: "success",
					message: "Proses berhasil. Permintaan duplikat diabaikan.",
				};
			}
			return { status: "error", message: error.message };
		}
		return {
			status: "error",
			message: "Database Error: Gagal mengeksekusi biaya admin.",
		};
	}

	// 7. Revalidate path
	revalidatePath("/biaya-admin");
	revalidatePath("/nasabah");
	revalidatePath("/rekening-induk");

	return {
		status: "success",
		message: "Biaya administrasi berhasil dibebankan.",
	};
}

export async function getAdminFeePreview(amountPerCustomer: number) {
	noStore();
	if (amountPerCustomer <= 0) {
		throw new Error("Nominal biaya harus lebih dari nol.");
	}

	try {
		const affectedCustomers = await prisma.customer.findMany({
			where: {
				status: "ACTIVE",
				balance: {
					gte: amountPerCustomer,
				},
			},
		});

		const customersToDeactivate = affectedCustomers.filter(
			(c) => c.balance.toNumber() - amountPerCustomer < 50000
		).length;

		return {
			customerCount: affectedCustomers.length,
			totalAmountCollected: affectedCustomers.length * amountPerCustomer,
			customersToDeactivate,
		};
	} catch (error) {
		console.error("Database Error:", error);
		throw new Error("Gagal mengambil data pratinjau biaya admin.");
	}
}
