import { z } from "zod";

// Skema validasi untuk form nasabah menggunakan Zod.
// Skema ini akan menjadi satu-satunya sumber kebenaran (single source of truth)
// untuk validasi di sisi server (Server Action) dan klien (form).
export const CustomerSchema = z.object({
	id: z.string().cuid().optional(), // CUID opsional, ada saat update
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
});

// Mengekstrak tipe TypeScript dari skema Zod untuk digunakan di komponen.
export type Customer = z.infer<typeof CustomerSchema>;

// Tipe untuk state yang akan dikembalikan oleh Server Action,
// terutama untuk menangani pesan error validasi form.
export type State = {
	errors?: {
		name?: string[];
		idNumber?: string[];
		address?: string[];
		phone?: string[];
	};
	message?: string | null;
};
