// features/rekening-induk/types.ts

export type ActionState = {
	status: "success" | "error" | "validation_error";
	message: string | null;
	errors?: {
		[key: string]: string[] | undefined;
	};
};
