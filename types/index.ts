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
