"use server";

import { z } from "zod";
import { PrismaClient, MainAccountTransactionSource } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { generateUniqueReceiptNumber } from "@/lib/receipt-generator";
import type { ActionState } from "@/types";

const prisma = new PrismaClient();

const LedgerActionSchema = z.object({
	idempotencyKey: z.string().uuid(),
	amount: z.coerce
		.number()
		.positive({ message: "Jumlah harus lebih dari nol." }),
	description: z.string().min(3, { message: "Deskripsi wajib diisi." }),
	notes: z.string().optional(),
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

export async function topUpMainAccount(
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	const validatedFields = LedgerActionSchema.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			status: "validation_error",
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Data tidak valid.",
		};
	}

	const { amount, description, notes, idempotencyKey } = validatedFields.data;
	const accountId = await getMainAccountId();

	try {
		await prisma.$transaction(async (tx) => {
			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) {
				throw new Error("DUPLICATE_EXECUTION");
			}
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			await tx.mainAccount.update({
				where: { id: accountId },
				data: { balance: { increment: amount } },
			});

			const receiptNumber = await generateUniqueReceiptNumber("IK", 5, tx);

			await tx.mainAccountTransaction.create({
				data: {
					mainAccountId: accountId,
					receiptNumber: receiptNumber,
					amount,
					type: "KREDIT",
					description,
					notes,
					source: MainAccountTransactionSource.MANUAL_OPERATIONAL,
				},
			});
		});
	} catch (error: unknown) {
		if (error instanceof Error && error.message === "DUPLICATE_EXECUTION") {
			return {
				status: "success",
				message: "Top up berhasil. Permintaan duplikat diabaikan.",
			};
		}
		console.error(error);
		return {
			status: "error",
			message: "Database Error: Gagal melakukan top up.",
		};
	}

	revalidatePath("/rekening-induk");
	return {
		status: "success",
		message: "Top up berhasil.",
	};
}

export async function withdrawMainAccount(
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	const validatedFields = LedgerActionSchema.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			status: "validation_error",
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Data tidak valid.",
		};
	}

	const { amount, description, notes, idempotencyKey } = validatedFields.data;
	const accountId = await getMainAccountId();

	try {
		await prisma.$transaction(async (tx) => {
			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) {
				throw new Error("DUPLICATE_EXECUTION");
			}
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			const account = await tx.mainAccount.findUniqueOrThrow({
				where: { id: accountId },
			});
			if (Number(account.balance) < amount) {
				throw new Error("Saldo rekening induk tidak mencukupi.");
			}

			await tx.mainAccount.update({
				where: { id: accountId },
				data: { balance: { decrement: amount } },
			});

			const receiptNumber = await generateUniqueReceiptNumber("IK", 5, tx);

			await tx.mainAccountTransaction.create({
				data: {
					mainAccountId: accountId,
					receiptNumber: receiptNumber,
					amount,
					type: "DEBIT",
					description,
					notes,
					source: MainAccountTransactionSource.MANUAL_OPERATIONAL,
				},
			});
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			if (error.message === "DUPLICATE_EXECUTION") {
				return {
					status: "success",
					message: "Penarikan berhasil. Permintaan duplikat diabaikan.",
				};
			}
			return {
				status: "error",
				message: error.message || "Database Error: Gagal melakukan penarikan.",
			};
		}
		return {
			status: "error",
			message: "Database Error: Gagal melakukan penarikan.",
		};
	}

	revalidatePath("/rekening-induk");
	return {
		status: "success",
		message: "Penarikan berhasil.",
	};
}
