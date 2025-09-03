"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Pencil } from "lucide-react";
import { NasabahForm } from "./nasabah-form";
import type { Customer } from "../types";

// Tipe props untuk komponen dialog
interface NasabahDialogProps {
	customer?: Customer | null;
	children: React.ReactNode; // Trigger untuk membuka dialog
}

/**
 * Komponen Dialog generik untuk menampilkan form nasabah.
 * Bisa digunakan untuk mode "Create" (jika customer tidak disediakan)
 * atau "Update" (jika customer disediakan).
 */
export function NasabahDialog({ customer, children }: NasabahDialogProps) {
	const [open, setOpen] = useState(false);

	// Fungsi ini akan dipanggil saat form berhasil disubmit
	// dan action redirect dieksekusi, atau saat dialog ditutup manual.
	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setOpen(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild onClick={() => setOpen(true)}>
				{children}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{customer ? "Edit Data Nasabah" : "Tambah Nasabah Baru"}
					</DialogTitle>
				</DialogHeader>
				{/* Render form di dalam dialog, teruskan data customer jika ada */}
				<NasabahForm customer={customer} />
			</DialogContent>
		</Dialog>
	);
}

/**
 * Komponen tombol khusus untuk "Tambah Nasabah".
 * Ini adalah contoh penggunaan NasabahDialog untuk mode "Create".
 */
export function CreateNasabahButton() {
	return (
		<NasabahDialog>
			<Button>
				<PlusCircle className="mr-2 h-4 w-4" />
				Tambah Nasabah
			</Button>
		</NasabahDialog>
	);
}
