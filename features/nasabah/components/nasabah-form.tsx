"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createCustomer, updateCustomer } from "../actions";
import type { Customer, State } from "../types";

// Props untuk komponen form, menerima data nasabah opsional untuk mode edit
interface NasabahFormProps {
	customer?: Customer | null;
}

export function NasabahForm({ customer }: NasabahFormProps) {
	// Tentukan action yang akan digunakan berdasarkan mode (buat baru atau update)
	const actionToUse = customer
		? updateCustomer.bind(null, customer.id!)
		: createCustomer;

	const initialState: State = { message: null, errors: {} };
	const [state, formAction] = useActionState(actionToUse, initialState);

	return (
		<form action={formAction} className="space-y-4">
			{/* Name Field */}
			<div className="space-y-2">
				<Label htmlFor="name">Nama Lengkap</Label>
				<Input
					id="name"
					name="name"
					placeholder="Masukkan nama lengkap"
					defaultValue={customer?.name}
					aria-describedby="name-error"
				/>
				<div id="name-error" aria-live="polite" aria-atomic="true">
					{state.errors?.name &&
						state.errors.name.map((error: string) => (
							<p className="mt-1 text-sm text-destructive" key={error}>
								{error}
							</p>
						))}
				</div>
			</div>

			{/* ID Number Field */}
			<div className="space-y-2">
				<Label htmlFor="idNumber">Nomor KTP</Label>
				<Input
					id="idNumber"
					name="idNumber"
					placeholder="Masukkan 16 digit Nomor KTP"
					defaultValue={customer?.idNumber}
					aria-describedby="idNumber-error"
				/>
				<div id="idNumber-error" aria-live="polite" aria-atomic="true">
					{state.errors?.idNumber &&
						state.errors.idNumber.map((error: string) => (
							<p className="mt-1 text-sm text-destructive" key={error}>
								{error}
							</p>
						))}
				</div>
			</div>

			{/* Address Field */}
			<div className="space-y-2">
				<Label htmlFor="address">Alamat</Label>
				<Input
					id="address"
					name="address"
					placeholder="Masukkan alamat lengkap"
					defaultValue={customer?.address}
					aria-describedby="address-error"
				/>
				<div id="address-error" aria-live="polite" aria-atomic="true">
					{state.errors?.address &&
						state.errors.address.map((error: string) => (
							<p className="mt-1 text-sm text-destructive" key={error}>
								{error}
							</p>
						))}
				</div>
			</div>

			{/* Phone Field */}
			<div className="space-y-2">
				<Label htmlFor="phone">Nomor Telepon</Label>
				<Input
					id="phone"
					name="phone"
					type="tel"
					placeholder="Masukkan nomor telepon aktif"
					defaultValue={customer?.phone}
					aria-describedby="phone-error"
				/>
				<div id="phone-error" aria-live="polite" aria-atomic="true">
					{state.errors?.phone &&
						state.errors.phone.map((error: string) => (
							<p className="mt-1 text-sm text-destructive" key={error}>
								{error}
							</p>
						))}
				</div>
			</div>

			{/* Menampilkan pesan error umum */}
			{state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
			)}

			<SubmitButton />
		</form>
	);
}

// Komponen terpisah untuk tombol submit agar bisa menggunakan hook useFormStatus
function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="w-full" aria-disabled={pending}>
			{pending ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Menyimpan...
				</>
			) : (
				"Simpan"
			)}
		</Button>
	);
}
