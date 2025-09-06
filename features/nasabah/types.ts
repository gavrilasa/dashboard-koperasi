import { z } from "zod";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

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
	ktpImage: z
		.instanceof(File, { message: "Foto KTP wajib diunggah." })
		.refine((file) => file.size <= MAX_FILE_SIZE, {
			message: `Ukuran gambar maksimal adalah 3 MB.`,
		})
		.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
			message: "Hanya format .jpg, .jpeg, .png, dan .webp yang didukung.",
		})
		.optional(),

	initialBalance: z.coerce
		.number()
		.min(50000, { message: "Saldo awal minimal adalah Rp 50.000." })
		.optional(),
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

export type ActionState = {
	status: "success" | "error" | "validation_error";
	message: string | null;
	fields?: FormFields;
	data?: {
		amount?: number;
		customerName?: string;
	};
	errors?: {
		[key: string]: string[] | undefined;
	};
};

type FormFields = {
	name?: string;
	idNumber?: string;
	address?: string;
	phone?: string;
	gender?: "MALE" | "FEMALE";
	birthDate?: string;
	initialBalance?: string;
};

export type SearchedCustomer = {
	id: string;
	name: string;
	accountNumber: string;
};

export interface CustomerContextType {
	customer: Customer;
}

export type DialogAction = "deposit" | "withdraw" | "transfer" | null;

export interface DepositFormProps {
	onSuccess: () => void;
}

export interface KtpDisplayProps {
	ktpUrl: string;
	customerName: string;
}

export interface NasabahDialogProps {
	customer?: Customer | null;
	children: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

type CustomerInfo = {
	name: string;
	accountNumber: string;
	address: string;
};

type TransactionInfo = {
	id: string;
	createdAt: Date;
	description: string;
	type: "KREDIT" | "DEBIT";
	amount: number;
};

export type PrintLayoutProps = {
	customer: CustomerInfo;
	transactions: TransactionInfo[];
	dateRange: {
		from: string;
		to: string;
	};
	saldoAwal: number;
};

export interface StatusActionButtonProps {
	customer: Pick<Customer, "id" | "status" | "name">;
}

export interface TransactionHistoryProps {
	customerId: string;
	currentPage: number;
}

export interface TransferFormProps {
	onSuccess: () => void;
}

export interface WithdrawFormProps {
	onSuccess: () => void;
}
