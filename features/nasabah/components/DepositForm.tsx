"use client";

import { useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCustomer } from "./CustomerContext";
import { deposit } from "../actions";
import type { ActionState } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { DepositFormProps } from "../types";

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="w-full" aria-disabled={pending}>
			{pending ? (
				<>
					<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					Menyimpan...
				</>
			) : (
				"Konfirmasi Simpanan"
			)}
		</Button>
	);
}

export function DepositForm({ onSuccess }: DepositFormProps) {
	const { customer } = useCustomer();
	const initialState: ActionState = {
		status: "validation_error",
		message: null,
		errors: {},
	};

	const [state, formAction] = useActionState(deposit, initialState);

	useEffect(() => {
		if (state.status === "success") {
			toast.success("Transaksi Berhasil", {
				description: `Berhasil menyimpan dana sejumlah ${formatCurrency(
					state.data?.amount ?? 0
				)} untuk nasabah ${state.data?.customerName}.`,
			});
			onSuccess();
		}
	}, [state, onSuccess]);

	return (
		<form action={formAction} className="space-y-4">
			<input type="hidden" name="customerId" value={customer.id} />
			<input type="hidden" name="idempotencyKey" value={crypto.randomUUID()} />

			<div className="space-y-2">
				<Label htmlFor="amount">Jumlah Simpanan</Label>
				<Input
					id="amount"
					name="amount"
					type="number"
					placeholder="Rp 0"
					required
					aria-describedby="amount-error"
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
				<Label htmlFor="notes">Catatan (Opsional)</Label>
				<Input
					id="notes"
					name="notes"
					placeholder="Contoh: Setoran awal, pembayaran cicilan"
				/>
			</div>

			{state.status === "error" && state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
			)}

			<SubmitButton />
		</form>
	);
}
