"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export type FormState = {
	message: string;
};

export async function authenticate(
	prevState: FormState | undefined,
	formData: FormData
) {
	try {
		await signIn("credentials", formData);
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return { message: "Email atau password salah." };
				default:
					return { message: "Terjadi kesalahan. Mohon coba lagi." };
			}
		}

		throw error;
	}
	return { message: "" };
}

export async function signOutAction() {
	await signOut({ redirectTo: "/login" });
}
