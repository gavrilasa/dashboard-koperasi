// features/nasabah/types.ts

import { z } from "zod";
// FIX: Hapus impor 'Prisma' yang tidak digunakan
export const CustomerFormSchema = z.object({
	id: z.string().cuid().optional(),
	name: z
		.string()
		.min(3, { message: "Nama harus terdiri dari minimal 3 karakter." }),
	idNumber: z
		.string()
		.length(16, { message: "Nomor KTP harus terdiri dari 16 digit." }),
	address: z
		.string()
		.min(10, { message: "Alamat harus terdiri dari minimal 10 karakter." }),
	phone: z
		.string()
		.min(10, { message: "Nomor telepon harus terdiri dari minimal 10 digit." }),
	gender: z.enum(["MALE", "FEMALE"], {
		message: "Jenis kelamin harus dipilih.",
	}),
	birthDate: z.coerce.date({
		message: "Tanggal lahir wajib diisi.",
	}),
});

export type Customer = {
	id: string;
	name: string;
	idNumber: string;
	address: string;
	phone: string;
	gender: "MALE" | "FEMALE";
	birthDate: Date;
	accountNumber: string;
	balance: number;
	status: "ACTIVE" | "INACTIVE";
	createdAt: Date;
	updatedAt: Date;
};

// Tipe State untuk Server Actions
export type State = {
	errors?: {
		[key: string]: string[] | undefined;
	};
	message?: string | null;
};
