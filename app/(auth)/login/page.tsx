"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate, type FormState } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
	const initialState: FormState | undefined = undefined;
	const [state, dispatch] = useActionState(authenticate, initialState);

	return (
		<Card className="w-full max-w-sm mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl">Login Admin</CardTitle>
				<CardDescription>
					Masukkan email dan password untuk mengakses dasbor.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form action={dispatch} className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							name="email"
							placeholder="admin@koperasi.dev"
							required
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input id="password" type="password" name="password" required />
					</div>

					{state?.message && (
						<div
							className="flex items-center gap-2 p-3 text-sm text-red-700 border border-red-200 rounded-md bg-red-50"
							aria-live="polite"
						>
							<AlertCircle className="w-4 h-4" />
							<p>{state.message}</p>
						</div>
					)}

					<LoginButton />
				</form>
			</CardContent>
		</Card>
	);
}

function LoginButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="w-full" aria-disabled={pending}>
			{pending ? "Memproses..." : "Login"}
		</Button>
	);
}
