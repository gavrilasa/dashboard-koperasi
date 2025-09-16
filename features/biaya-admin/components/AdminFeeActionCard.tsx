// File: features/biaya-admin/components/AdminFeeActionCard.tsx

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
import { getAdminFeePreview } from "@/features/biaya-admin/actions";
import { AdminFeeConfirmDialog } from "./AdminFeeConfirmDialog";
import { formatCurrency } from "@/lib/utils";
import type { PreviewData } from "../types";

export default function AdminFeeActionCard() {
	const [isPending, startTransition] = useTransition();
	const [amount, setAmount] = useState<number>(0);
	const [description, setDescription] = useState<string>("");
	const [previewData, setPreviewData] = useState<PreviewData | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handlePreview = () => {
		if (amount <= 0 || description.trim() === "") {
			toast.error("Data Tidak Lengkap", {
				description: "Harap isi nominal biaya dan deskripsi.",
			});
			return;
		}

		startTransition(async () => {
			try {
				const data = await getAdminFeePreview(amount);
				if (data.customerCount === 0) {
					toast.warning("Tidak Ada Nasabah", {
						description: "Tidak ada nasabah aktif yang memenuhi kriteria.",
					});
					return;
				}

				setPreviewData({
					...data,
					amountPerCustomer: amount,
					description,
				});
				setIsDialogOpen(true);
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Terjadi kesalahan tidak diketahui.";
				toast.error("Gagal Menghitung Pratinjau", {
					description: errorMessage,
				});
			}
		});
	};

	return (
		<>
			<Card className="max-w-md shadow-lg">
				<CardHeader>
					<CardTitle>Eksekusi Biaya Admin</CardTitle>
					<CardDescription>
						Masukkan nominal dan deskripsi biaya yang akan dibebankan ke semua
						nasabah aktif.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="amount">Nominal Biaya per Nasabah</Label>
						<Input
							id="amount"
							name="amount"
							type="number"
							placeholder="Rp 0"
							value={amount || ""}
							onChange={(e) => setAmount(Number(e.target.value))}
							disabled={isPending}
						/>
						<p className="text-sm text-muted-foreground">
							Jumlah yang dimasukkan:{" "}
							<span className="font-semibold">{formatCurrency(amount)}</span>
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Deskripsi Transaksi</Label>
						<Input
							id="description"
							name="description"
							placeholder="Contoh: Biaya Admin September 2024"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={isPending}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						onClick={handlePreview}
						disabled={isPending || amount <= 0 || !description}
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
				<AdminFeeConfirmDialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					previewData={previewData}
				/>
			)}
		</>
	);
}
