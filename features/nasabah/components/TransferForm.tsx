"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { useCustomer } from "./CustomerContext";
import { transfer, searchActiveCustomers } from "../actions";
import type { ActionState } from "@/types";
import type { SearchedCustomer } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { formatCurrency, cn, parseRupiahInput } from "@/lib/utils";
import { TransferFormProps } from "../types";
import { useCurrencyInput } from "@/hooks/use-currency-input";

function SubmitButton({ disabled }: { disabled: boolean }) {
	const { pending } = useFormStatus();
	return (
		<Button
			type="submit"
			className="w-full"
			disabled={disabled || pending}
			aria-disabled={disabled || pending}
		>
			{pending ? (
				<>
					<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					Mengirim...
				</>
			) : (
				"Konfirmasi Transfer"
			)}
		</Button>
	);
}

export function TransferForm({ onSuccess }: TransferFormProps) {
	const { customer: sourceCustomer } = useCustomer();
	const { rawValue: amountRawValue, inputProps: amountInputProps } =
		useCurrencyInput({ maxValue: sourceCustomer.balance });
	const [clientError, setClientError] = useState<string | null>(null);

	const [open, setOpen] = useState(false);
	const [destCustomer, setDestCustomer] = useState<SearchedCustomer | null>(
		null
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchedCustomer[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const initialState: ActionState = {
		status: "validation_error",
		message: null,
	};
	const [state, formAction] = useActionState(transfer, initialState);

	const debouncedSearch = useDebouncedCallback(async (query: string) => {
		if (query.length < 2) {
			setSearchResults([]);
			return;
		}
		setIsSearching(true);
		const results = await searchActiveCustomers(query);
		setSearchResults(results.filter((c) => c.id !== sourceCustomer.id));
		setIsSearching(false);
	}, 300);

	useEffect(() => {
		debouncedSearch(searchQuery);
	}, [searchQuery, debouncedSearch]);

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = parseRupiahInput(e.target.value);
		const value = Number(rawValue);

		amountInputProps.onChange(e);

		if (value > sourceCustomer.balance) {
			setClientError("Jumlah transfer melebihi saldo yang tersedia.");
		} else if (value <= 0) {
			setClientError("Jumlah harus lebih dari nol.");
		} else {
			setClientError(null);
		}
	};

	useEffect(() => {
		if (state.status === "success") {
			toast.success("Transfer Berhasil", {
				description: `Berhasil mentransfer ${formatCurrency(
					state.data?.amount ?? 0
				)} ke ${state.data?.customerName}.`,
			});
			onSuccess();
		}
	}, [state, onSuccess]);

	const isSubmitDisabled =
		!!clientError || Number(amountRawValue) <= 0 || !destCustomer;

	return (
		<form action={formAction} className="space-y-4">
			<input type="hidden" name="sourceCustomerId" value={sourceCustomer.id} />
			<input
				type="hidden"
				name="destinationAccountNumber"
				value={destCustomer?.accountNumber ?? ""}
			/>
			<input type="hidden" name="idempotencyKey" value={crypto.randomUUID()} />

			<div className="p-3 border rounded-md bg-muted">
				<p className="text-sm text-muted-foreground">Saldo Tersedia</p>
				<p className="text-lg font-bold">
					{formatCurrency(sourceCustomer.balance)}
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="destination">Rekening Tujuan</Label>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="justify-between w-full font-normal"
						>
							{destCustomer
								? `${destCustomer.name} - ${destCustomer.accountNumber}`
								: "Cari nama atau no. rekening..."}
							<ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
						<Command>
							<CommandInput
								placeholder="Ketik untuk mencari..."
								onValueChange={setSearchQuery}
							/>
							<CommandList>
								{isSearching && (
									<div className="flex items-center justify-center p-2">
										<Loader2 className="w-4 h-4 animate-spin" />
									</div>
								)}
								{!isSearching && searchQuery.length > 1 && (
									<CommandEmpty>Nasabah tidak ditemukan.</CommandEmpty>
								)}
								<CommandGroup>
									{searchResults.map((customer) => (
										<CommandItem
											key={customer.id}
											value={`${customer.name} ${customer.accountNumber}`}
											onSelect={() => {
												setDestCustomer(customer);
												setOpen(false);
											}}
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													destCustomer?.id === customer.id
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											<div>
												<p className="text-sm font-medium">{customer.name}</p>
												<p className="text-xs text-muted-foreground">
													{customer.accountNumber}
												</p>
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				{state.errors?.destinationAccountNumber && (
					<p className="mt-1 text-sm text-destructive">
						{state.errors.destinationAccountNumber[0]}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="amount">Jumlah Transfer</Label>
				<Input
					id="amount"
					required
					{...amountInputProps}
					onChange={handleAmountChange}
					aria-describedby="amount-error"
				/>
				<input type="hidden" name="amount" value={amountRawValue} />
				<div id="amount-error" aria-live="polite" aria-atomic="true">
					{clientError && (
						<p className="mt-1 text-sm text-destructive">{clientError}</p>
					)}
					{state.errors?.amount?.map((error) => (
						<p className="mt-1 text-sm text-destructive" key={error}>
							{error}
						</p>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="notes">Catatan (Opsional)</Label>
				<Input id="notes" name="notes" placeholder="Contoh: Pembayaran" />
			</div>

			{state.status === "error" && state.message && (
				<p className="text-sm text-destructive">{state.message}</p>
			)}

			<SubmitButton disabled={isSubmitDisabled} />
		</form>
	);
}
