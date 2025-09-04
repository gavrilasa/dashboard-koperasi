"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createCustomer, updateCustomer } from "../actions";
import type { Customer, State } from "../types";

// Props untuk komponen form
interface NasabahFormProps {
	customer?: Customer | null;
}

// Helper untuk format tanggal YYYY-MM-DD
const formatDateForInput = (date?: Date | string | null): string => {
	if (!date) return "";
	const d = new Date(date);
	if (isNaN(d.getTime())) return "";
	const year = d.getFullYear();
	const month = (d.getMonth() + 1).toString().padStart(2, "0");
	const day = d.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export function NasabahForm({ customer }: NasabahFormProps) {
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
					required
				/>
				<div id="name-error" aria-live="polite" aria-atomic="true">
					{state.errors?.name?.map((error: string) => (
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
					required
				/>
				<div id="idNumber-error" aria-live="polite" aria-atomic="true">
					{state.errors?.idNumber?.map((error: string) => (
						<p className="mt-1 text-sm text-destructive" key={error}>
							{error}
						</p>
					))}
				</div>
			</div>

			{/* Gender and Birth Date Fields (in a grid) */}
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="gender">Jenis Kelamin</Label>
					<Select name="gender" defaultValue={customer?.gender}>
						<SelectTrigger id="gender" aria-describedby="gender-error">
							<SelectValue placeholder="Pilih jenis kelamin" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="MALE">Laki-laki</SelectItem>
							<SelectItem value="FEMALE">Perempuan</SelectItem>
						</SelectContent>
					</Select>
					<div id="gender-error" aria-live="polite" aria-atomic="true">
						{state.errors?.gender?.map((error: string) => (
							<p className="mt-1 text-sm text-destructive" key={error}>
								{error}
							</p>
						))}
					</div>
				</div>
				<div className="space-y-2">
					<Label htmlFor="birthDate">Tanggal Lahir</Label>
					<Input
						id="birthDate"
						name="birthDate"
						type="date"
						defaultValue={formatDateForInput(customer?.birthDate)}
						aria-describedby="birthDate-error"
						required
					/>
					<div id="birthDate-error" aria-live="polite" aria-atomic="true">
						{state.errors?.birthDate?.map((error: string) => (
							<p className="mt-1 text-sm text-destructive" key={error}>
								{error}
							</p>
						))}
					</div>
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
					required
				/>
				<div id="address-error" aria-live="polite" aria-atomic="true">
					{state.errors?.address?.map((error: string) => (
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
					required
				/>
				<div id="phone-error" aria-live="polite" aria-atomic="true">
					{state.errors?.phone?.map((error: string) => (
						<p className="mt-1 text-sm text-destructive" key={error}>
							{error}
						</p>
					))}
				</div>
			</div>

			{state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
			)}

			<SubmitButton isEdit={!!customer} />
		</form>
	);
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
	const { pending } = useFormStatus();
	const buttonText = isEdit ? "Simpan Perubahan" : "Tambah Nasabah";

	return (
		<Button type="submit" className="w-full" aria-disabled={pending}>
			{pending ? (
				<>
					<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					Menyimpan...
				</>
			) : (
				buttonText
			)}
		</Button>
	);
}
