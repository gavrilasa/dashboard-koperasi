"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useState, type ChangeEvent } from "react";
import Image from "next/image";
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
import type { ActionState } from "@/types";
import type { Customer } from "../types";

const formatDateForInput = (date?: Date | string | null): string => {
	if (!date) return "";
	const d = new Date(date);
	if (isNaN(d.getTime())) return "";
	const year = d.getFullYear();
	const month = (d.getMonth() + 1).toString().padStart(2, "0");
	const day = d.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export function NasabahForm({ customer }: { customer?: Customer | null }) {
	const actionToUse = customer
		? updateCustomer.bind(null, customer.id!)
		: createCustomer;

	const initialState: ActionState = {
		status: "validation_error",
		message: null,
		errors: {},
		fields: {},
	};

	const [state, formAction] = useActionState(actionToUse, initialState);

	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		}

		if (!file) {
			setSelectedFile(null);
			setFileError(null);
			return;
		}

		if (file.size > 3 * 1024 * 1024) {
			setFileError("Ukuran gambar maksimal adalah 3 MB.");
			e.target.value = "";
			setSelectedFile(null);
			return;
		}

		if (!file.type.startsWith("image/")) {
			setFileError("File yang diunggah harus berupa gambar.");
			e.target.value = "";
			setSelectedFile(null);
			return;
		}

		setFileError(null);
		setSelectedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
	};

	return (
		<form action={formAction} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Nama Lengkap</Label>
				<Input
					id="name"
					name="name"
					placeholder="Masukkan nama lengkap"
					defaultValue={state.fields?.name ?? customer?.name}
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

			<div className="space-y-2">
				<Label htmlFor="idNumber">Nomor KTP</Label>
				<Input
					id="idNumber"
					name="idNumber"
					placeholder="Masukkan 16 digit Nomor KTP"
					defaultValue={state.fields?.idNumber ?? customer?.idNumber}
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

			{!customer && (
				<div className="space-y-2">
					<Label htmlFor="ktpImage">Foto KTP</Label>
					<Input
						id="ktpImage"
						name="ktpImage"
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						aria-describedby="ktpImage-error"
						required={!customer}
					/>
					<div id="ktpImage-error" aria-live="polite" aria-atomic="true">
						{fileError && (
							<p className="mt-1 text-sm text-destructive">{fileError}</p>
						)}
						{state.errors?.ktpImage?.map((error: string) => (
							<p className="mt-1 text-sm text-destructive" key={error}>
								{error}
							</p>
						))}
					</div>

					{previewUrl && (
						<div className="relative w-full h-40 mt-2 overflow-hidden border rounded-md">
							<Image
								src={previewUrl}
								alt="Pratinjau KTP"
								layout="fill"
								objectFit="contain"
							/>
						</div>
					)}
				</div>
			)}

			{!customer && (
				<div className="space-y-2">
					<Label htmlFor="initialBalance">Saldo Awal</Label>
					<Input
						id="initialBalance"
						name="initialBalance"
						type="number"
						placeholder="Minimal Rp 50.000"
						defaultValue={state.fields?.initialBalance ?? ""}
						aria-describedby="initialBalance-error"
						required
					/>
					<div id="initialBalance-error" aria-live="polite" aria-atomic="true">
						{state.errors?.initialBalance?.map((error: string) => (
							<p className="mt-1 text-sm text-destructive" key={error}>
								{error}
							</p>
						))}
					</div>
				</div>
			)}

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="gender">Jenis Kelamin</Label>
					<Select
						name="gender"
						defaultValue={state.fields?.gender ?? customer?.gender}
					>
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
						defaultValue={formatDateForInput(
							state.fields?.birthDate ?? customer?.birthDate
						)}
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

			<div className="space-y-2">
				<Label htmlFor="address">Alamat</Label>
				<Input
					id="address"
					name="address"
					placeholder="Masukkan alamat lengkap"
					defaultValue={state.fields?.address ?? customer?.address}
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

			<div className="space-y-2">
				<Label htmlFor="phone">Nomor Telepon</Label>
				<Input
					id="phone"
					name="phone"
					type="tel"
					placeholder="Masukkan nomor telepon aktif"
					defaultValue={state.fields?.phone ?? customer?.phone}
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

			<SubmitButton isEdit={!!customer} isFileValid={!!selectedFile} />
		</form>
	);
}

function SubmitButton({
	isEdit,
	isFileValid,
}: {
	isEdit: boolean;
	isFileValid: boolean;
}) {
	const { pending } = useFormStatus();
	const buttonText = isEdit ? "Simpan Perubahan" : "Tambah Nasabah";
	const isDisabled = !isEdit && !isFileValid;

	return (
		<Button
			type="submit"
			className="w-full"
			aria-disabled={pending || isDisabled}
			disabled={pending || isDisabled}
		>
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
