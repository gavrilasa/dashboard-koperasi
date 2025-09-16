"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/utils";
import { unstable_noStore as noStore } from "next/cache";
import type { ActionState } from "@/types";
import { generateUniqueReceiptNumber } from "@/lib/receipt-generator";

const prisma = new PrismaClient();

const ProfitSharingSchema = z.object({
	idempotencyKey: z.string().uuid(),
	totalAmount: z.coerce
		.number()
		.positive({ message: "Jumlah bagi hasil harus lebih dari nol." }),
});

export async function executeProfitSharing(
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	const validatedFields = ProfitSharingSchema.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			status: "validation_error",
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Gagal memproses. Data yang dimasukkan tidak valid.",
		};
	}

	const { totalAmount, idempotencyKey } = validatedFields.data;

	try {
		await prisma.$transaction(async (tx) => {
			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) {
				throw new Error("DUPLICATE_EXECUTION");
			}
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			const mainAccount = await tx.mainAccount.findFirst();
			if (!mainAccount || Number(mainAccount.balance) < totalAmount) {
				throw new Error("Saldo rekening induk tidak mencukupi.");
			}

			const activeCustomers = await tx.customer.findMany({
				where: { status: "ACTIVE" },
			});

			if (activeCustomers.length === 0) {
				throw new Error("Tidak ada nasabah aktif yang ditemukan.");
			}

			const numberOfRecipients = activeCustomers.length;
			const amountPerRecipient =
				Math.floor((totalAmount * 100) / numberOfRecipients) / 100;
			const totalDistributed = amountPerRecipient * numberOfRecipients;
			const remainderAmount = totalAmount - totalDistributed;

			await tx.mainAccount.update({
				where: { id: mainAccount.id },
				data: { balance: { decrement: totalAmount } },
			});

			const receiptNumber = await generateUniqueReceiptNumber("IK", 5, tx);

			const mainAccountTx = await tx.mainAccountTransaction.create({
				data: {
					mainAccountId: mainAccount.id,
					receiptNumber: receiptNumber,
					amount: totalAmount,
					type: "DEBIT",
					description: `Bagi Hasil - ${formatDate(new Date())}`,
					notes: `Total didistribusikan: ${totalDistributed}. Sisa pembulatan: ${remainderAmount} dikembalikan.`,
				},
			});

			const profitSharingEvent = await tx.profitSharingEvent.create({
				data: {
					totalAmountShared: totalAmount,
					numberOfRecipients,
					amountPerRecipient,
					remainderAmount,
					mainAccountDebitTxId: mainAccountTx.id,
				},
			});

			const customerIds = activeCustomers.map((c) => c.id);

			await tx.customer.updateMany({
				where: {
					id: {
						in: customerIds,
					},
				},
				data: {
					balance: {
						increment: amountPerRecipient,
					},
				},
			});

			await tx.transaction.createMany({
				data: customerIds.map((customerId) => ({
					customerId,
					receiptNumber: "", // Placeholder, akan diisi di bawah
					amount: amountPerRecipient,
					type: "KREDIT",
					description: `Bagi Hasil - ${formatDate(new Date())}`,
					profitSharingEventId: profitSharingEvent.id,
				})),
			});

			// Update receipt numbers for each transaction
			const transactionsToUpdate = await tx.transaction.findMany({
				where: { profitSharingEventId: profitSharingEvent.id },
			});

			for (const trans of transactionsToUpdate) {
				const uniqueReceipt = await generateUniqueReceiptNumber("SP", 7, tx);
				await tx.transaction.update({
					where: { id: trans.id },
					data: { receiptNumber: uniqueReceipt },
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
			message: "Database Error: Gagal mengeksekusi bagi hasil.",
		};
	}

	revalidatePath("/bagi-hasil");
	revalidatePath("/rekening-induk");

	return {
		status: "success",
		message: "Proses bagi hasil berhasil dieksekusi.",
	};
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
