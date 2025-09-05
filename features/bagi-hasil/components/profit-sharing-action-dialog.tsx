// features/bagi-hasil/components/profit-sharing-action-dialog.tsx

"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation"; // 👈 Impor useRouter
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
import { executeProfitSharing } from "@/features/bagi-hasil/actions";
import type { ActionState } from "@/features/bagi-hasil/types";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ... (Tipe PreviewData tetap sama)
type PreviewData = {
	totalAmount: number;
	customerCount: number;
	amountPerRecipient: number;
};

interface ProfitSharingConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	previewData: PreviewData;
}

// ... (Komponen SubmitButton tetap sama)
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

export function ProfitSharingConfirmDialog({
	open,
	onOpenChange,
	previewData,
}: ProfitSharingConfirmDialogProps) {
	const router = useRouter(); // 👈 Inisialisasi router
	const initialState: ActionState = { status: "error", message: null };
	const [state, formAction] = useActionState(
		executeProfitSharing,
		initialState
	);

	useEffect(() => {
		if (state.status === "success" && state.message) {
			toast.success("Eksekusi Berhasil", {
				description: state.message,
			});
			onOpenChange(false); // Tutup dialog
			router.refresh(); // 👈 Perintahkan Next.js untuk memuat ulang data di halaman saat ini
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
					<AlertDialogTitle>Konfirmasi Eksekusi Bagi Hasil</AlertDialogTitle>
					<AlertDialogDescription>
						Anda akan mendistribusikan dana kepada nasabah aktif. Pastikan
						detail di bawah ini sudah benar sebelum melanjutkan. Tindakan ini
						tidak dapat dibatalkan.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="p-4 my-4 space-y-2 text-sm border rounded-md bg-muted">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Total Dana Dibagikan:</span>
						<span className="font-semibold">
							{formatCurrency(previewData.totalAmount)}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Jumlah Nasabah Aktif:</span>
						<span className="font-semibold">{previewData.customerCount}</span>
					</div>
					<hr className="my-2 border-dashed" />
					<div className="flex justify-between">
						<span className="text-muted-foreground">Dana per Nasabah:</span>
						<span className="font-bold text-green-600">
							{formatCurrency(previewData.amountPerRecipient)}
						</span>
					</div>
				</div>

				<form action={formAction}>
					<input
						type="hidden"
						name="totalAmount"
						value={previewData.totalAmount}
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
