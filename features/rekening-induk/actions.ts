// features/rekening-induk/actions.ts

"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { State } from "@/features/nasabah/types"; // Bisa gunakan tipe State yang sama

const prisma = new PrismaClient();

const LedgerActionSchema = z.object({
	amount: z.coerce
		.number()
		.positive({ message: "Jumlah harus lebih dari nol." }),
	description: z.string().min(3, { message: "Deskripsi wajib diisi." }),
	notes: z.string().optional(),
});

// Fungsi untuk mendapatkan ID rekening induk (asumsi hanya ada satu)
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
	prevState: State,
	formData: FormData
): Promise<State> {
	const validatedFields = LedgerActionSchema.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Data tidak valid.",
		};
	}

	const { amount, description, notes } = validatedFields.data;
	const accountId = await getMainAccountId();

	try {
		await prisma.$transaction(async (tx) => {
			await tx.mainAccount.update({
				where: { id: accountId },
				data: { balance: { increment: amount } },
			});

			await tx.mainAccountTransaction.create({
				data: {
					mainAccountId: accountId,
					amount,
					type: "KREDIT",
					description,
					notes,
				},
			});
		});
	} catch (error) {
		return { message: "Database Error: Gagal melakukan top up." };
	}

	revalidatePath("/rekening-induk");
	return { message: "Top up berhasil." };
}

export async function withdrawMainAccount(
	prevState: State,
	formData: FormData
): Promise<State> {
	const validatedFields = LedgerActionSchema.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Data tidak valid.",
		};
	}

	const { amount, description, notes } = validatedFields.data;
	const accountId = await getMainAccountId();

	try {
		await prisma.$transaction(async (tx) => {
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

			await tx.mainAccountTransaction.create({
				data: {
					mainAccountId: accountId,
					amount,
					type: "DEBIT",
					description,
					notes,
				},
			});
		});
	} catch (error: any) {
		return {
			message: error.message || "Database Error: Gagal melakukan penarikan.",
		};
	}

	revalidatePath("/rekening-induk");
	return { message: "Penarikan berhasil." };
}
