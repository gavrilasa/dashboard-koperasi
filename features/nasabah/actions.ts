"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { State } from "./types"; // Asumsikan types.ts sudah ada
import { CustomerSchema } from "./types";

const prisma = new PrismaClient();

// --- Skema Validasi untuk Aksi ---
const CreateCustomerSchema = CustomerSchema.omit({ id: true });
const DepositWithdrawSchema = z.object({
	idempotencyKey: z.string().uuid(),
	customerId: z.string().cuid(),
	amount: z.coerce
		.number()
		.positive({ message: "Jumlah harus lebih dari nol." }),
	notes: z.string().optional(),
});
const TransferSchema = z.object({
	idempotencyKey: z.string().uuid(),
	sourceCustomerId: z.string().cuid(),
	destinationAccountNumber: z
		.string()
		.min(1, { message: "Nomor rekening tujuan wajib diisi." }),
	amount: z.coerce
		.number()
		.positive({ message: "Jumlah harus lebih dari nol." }),
	notes: z.string().optional(),
});

// --- Fungsi Utilitas ---
function generateAccountNumber(): string {
	const prefix = "KSP";
	const year = new Date().getFullYear().toString().slice(-2);
	const randomPart = Math.floor(10000000 + Math.random() * 90000000).toString();
	return `${prefix}${year}${randomPart}`;
}

// --- Aksi Profil Nasabah ---

export async function createCustomer(
	prevState: State,
	formData: FormData
): Promise<State> {
	const validatedFields = CreateCustomerSchema.safeParse(
		Object.fromEntries(formData.entries())
	);
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Gagal membuat nasabah.",
		};
	}
	const { name, idNumber, address, phone, gender, birthDate } =
		validatedFields.data;
	try {
		await prisma.customer.create({
			data: {
				name,
				idNumber,
				address,
				phone,
				gender,
				birthDate,
				accountNumber: generateAccountNumber(),
				balance: 0,
				status: "ACTIVE",
			},
		});
	} catch (error) {
		return { message: "Database Error: Gagal membuat nasabah." };
	}
	revalidatePath("/nasabah");
	redirect("/nasabah");
}

export async function updateCustomer(
	id: string,
	prevState: State,
	formData: FormData
): Promise<State> {
	const validatedFields = CreateCustomerSchema.safeParse(
		Object.fromEntries(formData.entries())
	);
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Gagal memperbarui nasabah.",
		};
	}
	try {
		await prisma.customer.update({ where: { id }, data: validatedFields.data });
	} catch (error) {
		return { message: "Database Error: Gagal memperbarui nasabah." };
	}
	revalidatePath(`/nasabah/${id}`);
	revalidatePath("/nasabah");
	redirect(`/nasabah/${id}`);
}

export async function deactivateCustomer(id: string) {
	try {
		const customer = await prisma.customer.findUnique({
			where: { id },
			select: { balance: true },
		});
		if (Number(customer?.balance) !== 0) {
			throw new Error(
				"Hanya nasabah dengan saldo nol yang dapat dinonaktifkan."
			);
		}
		await prisma.customer.update({
			where: { id },
			data: { status: "INACTIVE" },
		});
		revalidatePath(`/nasabah/${id}`);
		revalidatePath("/nasabah");
	} catch (error) {
		console.error(error);
		throw new Error("Gagal menonaktifkan nasabah.");
	}
}

export async function reactivateCustomer(id: string) {
	try {
		await prisma.customer.update({ where: { id }, data: { status: "ACTIVE" } });
		revalidatePath(`/nasabah/${id}`);
		revalidatePath("/nasabah");
	} catch (error) {
		throw new Error("Gagal mengaktifkan nasabah.");
	}
}

// --- Aksi Transaksional ---

export async function deposit(
	prevState: State,
	formData: FormData
): Promise<State> {
	const validatedFields = DepositWithdrawSchema.safeParse(
		Object.fromEntries(formData.entries())
	);
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Data tidak valid.",
		};
	}
	const { customerId, amount, notes, idempotencyKey } = validatedFields.data;

	try {
		await prisma.$transaction(async (tx) => {
			// 1. Cek Idempotency
			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) throw new Error("DUPLICATE_TRANSACTION");
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			// 2. Update saldo nasabah
			await tx.customer.update({
				where: { id: customerId },
				data: { balance: { increment: amount } },
			});

			// 3. Buat record transaksi KREDIT untuk nasabah
			await tx.transaction.create({
				data: {
					customerId,
					amount,
					type: "KREDIT",
					description: "SIMPAN TUNAI",
					notes,
				},
			});
			// TODO: Logika untuk menambah saldo & transaksi di Rekening Induk
		});
	} catch (error: any) {
		if (error.message === "DUPLICATE_TRANSACTION") {
			return { message: "Transaksi berhasil. Permintaan duplikat diabaikan." };
		}
		return { message: "Database Error: Gagal melakukan simpanan." };
	}
	revalidatePath(`/nasabah/${customerId}`);
	revalidatePath("/nasabah");
	return { message: "Simpanan berhasil ditambahkan." };
}

export async function withdraw(
	prevState: State,
	formData: FormData
): Promise<State> {
	const validatedFields = DepositWithdrawSchema.safeParse(
		Object.fromEntries(formData.entries())
	);
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Data tidak valid.",
		};
	}
	const { customerId, amount, notes, idempotencyKey } = validatedFields.data;

	try {
		await prisma.$transaction(async (tx) => {
			// 1. Cek Idempotency
			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) throw new Error("DUPLICATE_TRANSACTION");
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			// 2. Cek Saldo & Update
			const customer = await tx.customer.findUnique({
				where: { id: customerId },
			});
			if (!customer || Number(customer.balance) < amount) {
				throw new Error("Saldo tidak mencukupi.");
			}
			await tx.customer.update({
				where: { id: customerId },
				data: { balance: { decrement: amount } },
			});

			// 3. Buat record transaksi DEBIT
			await tx.transaction.create({
				data: {
					customerId,
					amount,
					type: "DEBIT",
					description: "TARIK TUNAI",
					notes,
				},
			});
			// TODO: Logika untuk mengurangi saldo & transaksi di Rekening Induk
		});
	} catch (error: any) {
		if (error.message === "DUPLICATE_TRANSACTION") {
			return { message: "Transaksi berhasil. Permintaan duplikat diabaikan." };
		}
		return {
			message: error.message || "Database Error: Gagal melakukan penarikan.",
		};
	}
	revalidatePath(`/nasabah/${customerId}`);
	revalidatePath("/nasabah");
	return { message: "Penarikan berhasil." };
}

export async function transfer(
	prevState: State,
	formData: FormData
): Promise<State> {
	const validatedFields = TransferSchema.safeParse(
		Object.fromEntries(formData.entries())
	);
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Data tidak valid.",
		};
	}
	const {
		sourceCustomerId,
		destinationAccountNumber,
		amount,
		notes,
		idempotencyKey,
	} = validatedFields.data;

	try {
		await prisma.$transaction(async (tx) => {
			// 1. Cek Idempotency
			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) throw new Error("DUPLICATE_TRANSACTION");
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			// 2. Ambil data pengirim dan penerima
			const sourceCustomer = await tx.customer.findUnique({
				where: { id: sourceCustomerId },
			});
			const destinationCustomer = await tx.customer.findUnique({
				where: { accountNumber: destinationAccountNumber },
			});

			// 3. Validasi
			if (!sourceCustomer || !destinationCustomer)
				throw new Error("Nasabah pengirim atau penerima tidak ditemukan.");
			if (sourceCustomer.id === destinationCustomer.id)
				throw new Error("Tidak bisa transfer ke rekening sendiri.");
			if (
				sourceCustomer.status !== "ACTIVE" ||
				destinationCustomer.status !== "ACTIVE"
			)
				throw new Error("Kedua nasabah harus berstatus aktif.");
			if (Number(sourceCustomer.balance) < amount)
				throw new Error("Saldo tidak mencukupi.");

			// 4. Update saldo kedua nasabah
			await tx.customer.update({
				where: { id: sourceCustomerId },
				data: { balance: { decrement: amount } },
			});
			await tx.customer.update({
				where: { id: destinationCustomer.id },
				data: { balance: { increment: amount } },
			});

			// 5. Buat dua record transaksi
			await tx.transaction.create({
				data: {
					customerId: sourceCustomerId,
					amount,
					type: "DEBIT",
					description: `TRANSFER KELUAR ke ${destinationCustomer.name}`,
					notes,
				},
			});
			await tx.transaction.create({
				data: {
					customerId: destinationCustomer.id,
					amount,
					type: "KREDIT",
					description: `TRANSFER MASUK dari ${sourceCustomer.name}`,
					notes,
				},
			});
		});
	} catch (error: any) {
		if (error.message === "DUPLICATE_TRANSACTION") {
			return { message: "Transaksi berhasil. Permintaan duplikat diabaikan." };
		}
		return {
			message: error.message || "Database Error: Gagal melakukan transfer.",
		};
	}
	revalidatePath(`/nasabah/${sourceCustomerId}`);
	revalidatePath("/nasabah");
	return { message: "Transfer berhasil." };
}
