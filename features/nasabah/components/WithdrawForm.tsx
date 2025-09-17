"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCustomer } from "./CustomerContext";
import { withdraw } from "../actions";
import type { ActionState } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { WithdrawFormProps } from "../types";

function SubmitButton({ disabled }: { disabled: boolean }) {
	const { pending } = useFormStatus();

	return (
		<Button
			type="submit"
			className="w-full"
			aria-disabled={pending || disabled}
			disabled={pending || disabled}
		>
			{pending ? (
				<>
					<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					Menarik...
				</>
			) : (
				"Konfirmasi Penarikan"
			)}
		</Button>
	);
}

export function WithdrawForm({ onSuccess }: WithdrawFormProps) {
	const { customer } = useCustomer();
	const [amount, setAmount] = useState(0);
	const [clientError, setClientError] = useState<string | null>(null);

	const initialState: ActionState = {
		status: "validation_error",
		message: null,
		errors: {},
	};

	const [state, formAction] = useActionState(withdraw, initialState);

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value);
		setAmount(value);

		if (value > customer.balance) {
			setClientError("Jumlah penarikan melebihi saldo yang tersedia.");
		} else if (value <= 0) {
			setClientError("Jumlah harus lebih dari nol.");
		} else {
			setClientError(null);
		}
	};

	useEffect(() => {
		if (state.status === "success") {
			toast.success("Transaksi Berhasil", {
				description: `Berhasil menarik dana sejumlah ${formatCurrency(
					state.data?.amount ?? 0
				)} dari nasabah ${state.data?.customerName}.`,
			});
			onSuccess();
		}
	}, [state, onSuccess]);

	const isSubmitDisabled = !!clientError || amount <= 0;

	return (
		<form action={formAction} className="space-y-4">
			<input type="hidden" name="customerId" value={customer.id} />
			<input type="hidden" name="idempotencyKey" value={crypto.randomUUID()} />

			<div className="p-3 border rounded-md bg-muted">
				<p className="text-sm text-muted-foreground">Saldo Tersedia</p>
				<p className="text-lg font-bold">{formatCurrency(customer.balance)}</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="amount">Jumlah Penarikan</Label>
				<Input
					id="amount"
					name="amount"
					type="number"
					placeholder="Rp 0"
					required
					onChange={handleAmountChange}
					aria-describedby="amount-error"
				/>
				<div id="amount-error" aria-live="polite" aria-atomic="true">
					{clientError && (
						<p className="mt-1 text-sm text-destructive">{clientError}</p>
					)}
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
					placeholder="Contoh: Penarikan untuk keperluan pribadi"
				/>
			</div>

			{state.status === "error" && state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
			)}

			<SubmitButton disabled={isSubmitDisabled} />
		</form>
	);
}
