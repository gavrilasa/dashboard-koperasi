"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getActiveCustomersCount } from "@/features/bagi-hasil/actions";
import { ProfitSharingConfirmDialog } from "./ProfitSharingActionDialog";
import { formatCurrency } from "@/lib/utils";
import { PreviewData } from "../types";

export function ProfitSharingActionCard() {
	const [isPending, startTransition] = useTransition();
	const [totalAmount, setTotalAmount] = useState<number>(0);
	const [previewData, setPreviewData] = useState<PreviewData | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handlePreview = () => {
		if (totalAmount <= 0) {
			toast.error("Jumlah tidak valid", {
				description: "Total bagi hasil harus lebih dari nol.",
			});
			return;
		}

		startTransition(async () => {
			try {
				// 👇 Call the server action here
				const customerCount = await getActiveCustomersCount();
				if (customerCount === 0) {
					toast.warning("Tidak ada nasabah aktif", {
						description:
							"Proses bagi hasil tidak dapat dilanjutkan karena tidak ada nasabah aktif.",
					});
					return;
				}

				const amountPerRecipient = Math.floor(totalAmount / customerCount);

				setPreviewData({
					totalAmount,
					customerCount,
					amountPerRecipient,
				});
				setIsDialogOpen(true);
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Terjadi kesalahan tidak diketahui.";
				toast.error("Gagal mengambil data", {
					description: errorMessage,
				});
			}
		});
	};

	return (
		// ... (JSX remains the same) ...
		<>
			<Card className="max-w-md shadow-lg">
				<CardHeader>
					<CardTitle>Eksekusi Bagi Hasil</CardTitle>
					<CardDescription>
						Masukkan jumlah total yang akan dibagikan ke semua nasabah aktif.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<Label htmlFor="totalAmount">Total Bagi Hasil</Label>
						<Input
							id="totalAmount"
							name="totalAmount"
							type="number"
							placeholder="Rp 0"
							value={totalAmount || ""}
							onChange={(e) => setTotalAmount(Number(e.target.value))}
							disabled={isPending}
						/>
						<p className="text-sm text-muted-foreground">
							Jumlah yang dimasukkan:{" "}
							<span className="font-semibold">
								{formatCurrency(totalAmount)}
							</span>
						</p>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						onClick={handlePreview}
						disabled={isPending || totalAmount <= 0}
						className="w-full"
					>
						{isPending ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Menghitung...
							</>
						) : (
							"Hitung Pratinjau"
						)}
					</Button>
				</CardFooter>
			</Card>

			{previewData && (
				<ProfitSharingConfirmDialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					previewData={previewData}
				/>
			)}
		</>
	);
}
