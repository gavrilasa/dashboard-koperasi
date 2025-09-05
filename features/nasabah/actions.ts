"use server";

import { z } from "zod";
import { PrismaClient, MainAccountTransactionSource } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState, SearchedCustomer } from "./types";
import { CustomerFormSchema } from "./types";
import { formatCurrency } from "@/lib/utils";

const prisma = new PrismaClient();

const CreateCustomerSchema = CustomerFormSchema.omit({
	id: true,
});
const UpdateCustomerSchema = CreateCustomerSchema;

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

async function getMainAccountId(): Promise<string> {
	let account = await prisma.mainAccount.findFirst();
	if (!account) {
		account = await prisma.mainAccount.create({
			data: { name: "Kas Operasional Koperasi", balance: 0 },
		});
	}
	return account.id;
}

function generateAccountNumber(): string {
	const prefix = "KSP";
	const year = new Date().getFullYear().toString().slice(-2);
	const randomPart = Math.floor(10000000 + Math.random() * 90000000).toString();
	return `${prefix}${year}${randomPart}`;
}

export async function createCustomer(
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	const validatedFields = CreateCustomerSchema.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			status: "validation_error",
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Gagal membuat nasabah. Data tidak valid.",
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
		console.error(error);
		return {
			status: "error",
			message: "Database Error: Gagal membuat nasabah.",
		};
	}

	revalidatePath("/nasabah");
	redirect("/nasabah");
}

export async function updateCustomer(
	id: string,
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	const validatedFields = UpdateCustomerSchema.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			status: "validation_error",
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Gagal memperbarui nasabah.",
		};
	}

	try {
		await prisma.customer.update({ where: { id }, data: validatedFields.data });
	} catch (error) {
		console.error(error);
		return {
			status: "error",
			message: "Database Error: Gagal memperbarui nasabah.",
		};
	}

	revalidatePath(`/nasabah/${id}`);
	revalidatePath("/nasabah");
	redirect(`/nasabah/${id}`);
}

export async function deposit(
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	const validatedFields = DepositWithdrawSchema.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			status: "validation_error",
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Data tidak valid.",
		};
	}
	const { customerId, amount, notes, idempotencyKey } = validatedFields.data;
	const mainAccountId = await getMainAccountId();
	let customerName = "";

	try {
		await prisma.$transaction(async (tx) => {
			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) throw new Error("DUPLICATE_TRANSACTION");
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			const customer = await tx.customer.update({
				where: { id: customerId },
				data: { balance: { increment: amount } },
			});
			customerName = customer.name;

			const customerTransaction = await tx.transaction.create({
				data: {
					customerId,
					amount,
					type: "KREDIT",
					description: "SIMPAN TUNAI",
					notes,
				},
			});

			await tx.mainAccount.update({
				where: { id: mainAccountId },
				data: { balance: { increment: amount } },
			});

			await tx.mainAccountTransaction.create({
				data: {
					mainAccountId,
					amount,
					type: "KREDIT",
					description: `Setoran Tunai dari Nasabah: ${customer.name}`,
					notes,
					source: MainAccountTransactionSource.FROM_CUSTOMER_DEPOSIT,
					customerTransactionId: customerTransaction.id,
				},
			});
		});
	} catch (error: unknown) {
		if (error instanceof Error && error.message === "DUPLICATE_TRANSACTION") {
			return {
				status: "success",
				message: "Transaksi berhasil. Permintaan duplikat diabaikan.",
			};
		}
		return {
			status: "error",
			message: "Database Error: Gagal melakukan simpanan.",
		};
	}

	revalidatePath(`/nasabah/${customerId}`);
	revalidatePath("/nasabah");
	revalidatePath("/rekening-induk");
	return {
		status: "success",
		message: "Simpanan berhasil ditambahkan.",
		data: { amount, customerName },
	};
}

export async function withdraw(
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	const validatedFields = DepositWithdrawSchema.safeParse(
		Object.fromEntries(formData.entries())
	);
	if (!validatedFields.success) {
		return {
			status: "validation_error",
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Data tidak valid.",
		};
	}
	const { customerId, amount, notes, idempotencyKey } = validatedFields.data;
	const mainAccountId = await getMainAccountId();
	let customerName = "";

	try {
		await prisma.$transaction(async (tx) => {
			const mainAccount = await tx.mainAccount.findUniqueOrThrow({
				where: { id: mainAccountId },
			});
			if (Number(mainAccount.balance) < amount) {
				throw new Error("Kas koperasi tidak mencukupi.");
			}

			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) throw new Error("DUPLICATE_TRANSACTION");
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			const customer = await tx.customer.findUnique({
				where: { id: customerId },
			});
			if (!customer || Number(customer.balance) < amount) {
				throw new Error("Saldo nasabah tidak mencukupi.");
			}
			customerName = customer.name;

			await tx.customer.update({
				where: { id: customerId },
				data: { balance: { decrement: amount } },
			});

			const customerTransaction = await tx.transaction.create({
				data: {
					customerId,
					amount,
					type: "DEBIT",
					description: "TARIK TUNAI",
					notes,
				},
			});

			await tx.mainAccount.update({
				where: { id: mainAccountId },
				data: { balance: { decrement: amount } },
			});

			await tx.mainAccountTransaction.create({
				data: {
					mainAccountId,
					amount,
					type: "DEBIT",
					description: `Penarikan Tunai oleh Nasabah: ${customer.name}`,
					notes,
					source: MainAccountTransactionSource.FROM_CUSTOMER_WITHDRAWAL,
					customerTransactionId: customerTransaction.id,
				},
			});
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { status: "error", message: error.message };
		}
		return {
			status: "error",
			message: "Database Error: Gagal melakukan penarikan.",
		};
	}

	revalidatePath(`/nasabah/${customerId}`);
	revalidatePath("/nasabah");
	revalidatePath("/rekening-induk");
	return {
		status: "success",
		message: "Penarikan berhasil.",
		data: { amount, customerName },
	};
}

export async function transfer(
	prevState: ActionState,
	formData: FormData
): Promise<ActionState> {
	const validatedFields = TransferSchema.safeParse(
		Object.fromEntries(formData.entries())
	);
	if (!validatedFields.success) {
		return {
			status: "validation_error",
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

	let destinationCustomerName = "";
	try {
		await prisma.$transaction(async (tx) => {
			const existingKey = await tx.idempotencyKey.findUnique({
				where: { id: idempotencyKey },
			});
			if (existingKey) throw new Error("DUPLICATE_TRANSACTION");
			await tx.idempotencyKey.create({ data: { id: idempotencyKey } });

			const sourceCustomer = await tx.customer.findUnique({
				where: { id: sourceCustomerId },
			});
			const destinationCustomer = await tx.customer.findUnique({
				where: { accountNumber: destinationAccountNumber },
			});

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

			destinationCustomerName = destinationCustomer.name;

			await tx.customer.update({
				where: { id: sourceCustomerId },
				data: { balance: { decrement: amount } },
			});
			await tx.customer.update({
				where: { id: destinationCustomer.id },
				data: { balance: { increment: amount } },
			});
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
	} catch (error: unknown) {
		if (error instanceof Error) {
			if (error.message === "DUPLICATE_TRANSACTION") {
				return {
					status: "success",
					message: "Transaksi berhasil. Permintaan duplikat diabaikan.",
				};
			}
			return { status: "error", message: error.message };
		}
		return {
			status: "error",
			message: "Database Error: Gagal melakukan transfer.",
		};
	}
	revalidatePath(`/nasabah/${sourceCustomerId}`);
	revalidatePath("/nasabah");
	return {
		status: "success",
		message: "Transfer berhasil.",
		data: { amount, customerName: destinationCustomerName },
	};
}

export async function searchActiveCustomers(
	query: string
): Promise<SearchedCustomer[]> {
	if (!query) {
		return [];
	}

	try {
		const customers = await prisma.customer.findMany({
			where: {
				status: "ACTIVE",
				OR: [
					{ name: { contains: query, mode: "insensitive" } },
					{ accountNumber: { contains: query, mode: "insensitive" } },
				],
			},
			select: {
				id: true,
				name: true,
				accountNumber: true,
			},
			take: 5,
		});
		return customers;
	} catch (error) {
		console.error("Database Error:", error);
		return [];
	}
}

export async function activateCustomer(id: string): Promise<ActionState> {
	try {
		await prisma.customer.update({
			where: { id },
			data: { status: "ACTIVE" },
		});
	} catch (error) {
		console.error("Database Error:", error);
		return {
			status: "error",
			message: "Database Error: Gagal mengaktifkan nasabah.",
		};
	}

	revalidatePath("/nasabah");
	revalidatePath(`/nasabah/${id}`);
	redirect(`/nasabah/${id}`);
}

export async function deactivateCustomer(id: string): Promise<ActionState> {
	try {
		const customer = await prisma.customer.findUniqueOrThrow({
			where: { id },
			select: { balance: true },
		});

		// --- LOGIKA BARU DI SINI ---
		// Tolak hanya jika saldo 1 Rupiah atau lebih.
		if (customer.balance.greaterThanOrEqualTo(1)) {
			return {
				status: "error",
				message: `Gagal menonaktifkan. Saldo nasabah harus kurang dari Rp1 (Saldo saat ini: ${formatCurrency(
					Number(customer.balance)
				)}).`,
			};
		}

		// Jika saldo antara 0 dan 1, nolkan saldo sebelum menonaktifkan.
		await prisma.customer.update({
			where: { id },
			data: {
				status: "INACTIVE",
				balance: 0, // Mengatur sisa saldo menjadi 0
			},
		});
		// --- AKHIR LOGIKA BARU ---
	} catch (error) {
		console.error("Database Error:", error);
		return {
			status: "error",
			message: "Database Error: Gagal menonaktifkan nasabah.",
		};
	}

	revalidatePath("/nasabah");
	revalidatePath(`/nasabah/${id}`);
	redirect(`/nasabah/${id}`);
}
