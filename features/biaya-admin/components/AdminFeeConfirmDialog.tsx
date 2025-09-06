// File: features/biaya-admin/components/AdminFeeConfirmDialog.tsx

"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { executeAdminFee } from "@/features/biaya-admin/actions";
import type { ActionState } from "@/features/biaya-admin/types";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { AdminFeeConfirmDialogProps } from "../types";

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<AlertDialogAction type="submit" disabled={pending}>
			{pending ? (
				<>
					<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					Memproses...
				</>
			) : (
				"Ya, Lanjutkan Eksekusi"
			)}
		</AlertDialogAction>
	);
}

export function AdminFeeConfirmDialog({
	open,
	onOpenChange,
	previewData,
}: AdminFeeConfirmDialogProps) {
	const router = useRouter();
	const initialState: ActionState = { status: "error", message: null };
	const [state, formAction] = useActionState(executeAdminFee, initialState);

	useEffect(() => {
		if (state.status === "success" && state.message) {
			toast.success("Eksekusi Berhasil", {
				description: state.message,
			});
			onOpenChange(false);
			router.refresh();
		} else if (state.status === "error" && state.message) {
			toast.error("Eksekusi Gagal", {
				description: state.message,
			});
			onOpenChange(false);
		}
	}, [state, onOpenChange, router]);

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Konfirmasi Pembebanan Biaya Admin</AlertDialogTitle>
					<AlertDialogDescription>
						Anda akan memotong saldo nasabah aktif sesuai detail di bawah ini.
						Tindakan ini tidak dapat dibatalkan.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="p-4 my-4 space-y-2 text-sm border rounded-md bg-muted">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Biaya per Nasabah:</span>
						<span className="font-semibold">
							{formatCurrency(previewData.amountPerCustomer)}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Nasabah Terdampak:</span>
						<span className="font-semibold">{previewData.customerCount}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Total Dana Terkumpul:</span>
						<span className="font-bold text-green-600">
							{formatCurrency(previewData.totalAmountCollected)}
						</span>
					</div>
					<hr className="my-2 border-dashed" />
					<div className="flex justify-between">
						<span className="text-muted-foreground">
							Nasabah menjadi non-aktif:
						</span>
						<span className="font-semibold text-red-600">
							{previewData.customersToDeactivate}
						</span>
					</div>
				</div>

				<form action={formAction}>
					<input
						type="hidden"
						name="amountPerCustomer"
						value={previewData.amountPerCustomer}
					/>
					<input
						type="hidden"
						name="description"
						value={previewData.description}
					/>
					<input
						type="hidden"
						name="idempotencyKey"
						value={crypto.randomUUID()}
					/>
					<AlertDialogFooter>
						<AlertDialogCancel>Batal</AlertDialogCancel>
						<SubmitButton />
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
