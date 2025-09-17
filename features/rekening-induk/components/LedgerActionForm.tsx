"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { topUpMainAccount, withdrawMainAccount } from "../actions";
import { LedgerActionFormProps } from "../types";
import type { ActionState } from "@/types";
import { useCurrencyInput } from "@/hooks/use-currency-input";

function SubmitButton({ type }: { type: "deposit" | "withdraw" }) {
	const { pending } = useFormStatus();
	const buttonText =
		type === "deposit" ? "Konfirmasi Top Up" : "Konfirmasi Penarikan";

	return (
		<Button type="submit" className="w-full" disabled={pending}>
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

	const initialState: ActionState = {
		status: "validation_error",
		message: null,
		errors: {},
	};
	const [state, formAction] = useActionState(actionToUse, initialState);

	const { rawValue: amountRawValue, inputProps: amountInputProps } =
		useCurrencyInput({});

	useEffect(() => {
		if (state.status === "success") {
			onSuccess();
		}
	}, [state, onSuccess]);

	return (
		<form action={formAction} className="space-y-4">
			<input type="hidden" name="idempotencyKey" value={crypto.randomUUID()} />
			<div className="space-y-2">
				<Label htmlFor="amount">Jumlah</Label>
				<Input
					id="amount"
					aria-describedby="amount-error"
					required
					{...amountInputProps}
				/>
				<input type="hidden" name="amount" value={amountRawValue} />
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
