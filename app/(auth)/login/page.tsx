"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
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
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
	const initialState: FormState | undefined = undefined;
	const [state, dispatch] = useActionState(authenticate, initialState);
	const [showPassword, setShowPassword] = useState(false);

	return (
		<Card className="w-full max-w-sm mx-auto shadow-lg">
			<CardHeader>
				<Image
					src="https://res.cloudinary.com/dah2v3xbg/image/upload/v1757598999/Logo-KSP-Ibnu-Khaldun_bdmwjz.webp"
					width={200}
					height={100}
					alt="Logo Koperasi"
					className="object-contain h-auto max-w-full mx-auto"
				/>
				<CardTitle className="text-xl pt-5">Login Admin</CardTitle>
				<CardDescription>
					Silakan masuk untuk mengakses dasbor koperasi.
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
							placeholder="Masukkan Email Koperasi"
							required
							autoFocus
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								name="password"
								required
								placeholder="••••••••"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute inset-y-0 right-0 h-full px-3"
								onClick={() => setShowPassword((prev) => !prev)}
								aria-label={
									showPassword ? "Sembunyikan password" : "Tampilkan password"
								}
							>
								{showPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</Button>
						</div>
					</div>

					{state?.message && (
						<div
							className="flex items-center gap-2 p-3 text-sm text-destructive border border-destructive/30 rounded-md bg-destructive/10"
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
		<Button
			type="submit"
			className="w-full"
			aria-disabled={pending}
			disabled={pending}
		>
			{pending ? (
				<>
					<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					<span>Memproses...</span>
				</>
			) : (
				"Login"
			)}
		</Button>
	);
}
