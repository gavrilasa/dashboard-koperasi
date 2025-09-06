"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { topUpMainAccount, withdrawMainAccount } from "../actions";
import { ActionState, LedgerActionFormProps } from "../types";

function SubmitButton({ type }: { type: "deposit" | "withdraw" }) {
	const { pending } = useFormStatus();
	const buttonText =
		type === "deposit" ? "Konfirmasi Top Up" : "Konfirmasi Penarikan";

	return (
		<Button type="submit" className="w-full" aria-disabled={pending}>
			{pending ? (
				<>
					<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					Memproses...
				</>
			) : (
				buttonText
			)}
		</Button>
	);
}

export function LedgerActionForm({ type, onSuccess }: LedgerActionFormProps) {
	const actionToUse =
		type === "deposit" ? topUpMainAccount : withdrawMainAccount;

	// FIX 2: Tambahkan properti 'status' yang wajib ada
	const initialState: ActionState = {
		status: "validation_error", // atau 'error', sesuaikan
		message: null,
		errors: {},
	};
	const [state, formAction] = useActionState(actionToUse, initialState);

	useEffect(() => {
		// Periksa status 'success' untuk memicu onSuccess
		if (state.status === "success") {
			onSuccess();
		}
	}, [state, onSuccess]);

	return (
		<form action={formAction} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="amount">Jumlah</Label>
				<Input
					id="amount"
					name="amount"
					type="number"
					placeholder="Rp 0"
					aria-describedby="amount-error"
					required
				/>
				<div id="amount-error" aria-live="polite" aria-atomic="true">
					{state.errors?.amount?.map((error: string) => (
						<p className="mt-1 text-sm text-destructive" key={error}>
							{error}
						</p>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Deskripsi Transaksi</Label>
				<Input
					id="description"
					name="description"
					placeholder="Contoh: Setoran modal awal"
					aria-describedby="description-error"
					required
				/>
				<div id="description-error" aria-live="polite" aria-atomic="true">
					{state.errors?.description?.map((error: string) => (
						<p className="mt-1 text-sm text-destructive" key={error}>
							{error}
						</p>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="notes">Catatan (Opsional)</Label>
				<Input
					id="notes"
					name="notes"
					placeholder="Masukkan catatan jika ada"
				/>
			</div>

			{state.status === "error" && state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
			)}

			<SubmitButton type={type} />
		</form>
	);
}
