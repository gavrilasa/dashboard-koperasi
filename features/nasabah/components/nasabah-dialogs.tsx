"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Pencil } from "lucide-react";
import { NasabahForm } from "./nasabah-form";
import type { Customer } from "../types";
import { NasabahDialogProps } from "../types";
// import { updateCustomer } from "../actions";

export function NasabahDialog({
	customer,
	children,
	open,
	onOpenChange,
}: NasabahDialogProps) {
	const [isOpen, setIsOpen] = useState(open);

	useEffect(() => {
		setIsOpen(open);
	}, [open]);

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		onOpenChange?.(open);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{customer ? "Edit Data Nasabah" : "Tambah Nasabah Baru"}
					</DialogTitle>
					<DialogDescription>
						{customer
							? "Lakukan perubahan pada data profil nasabah."
							: "Isi formulir di bawah ini untuk mendaftarkan nasabah baru."}
					</DialogDescription>
				</DialogHeader>
				<NasabahForm customer={customer} />
			</DialogContent>
		</Dialog>
	);
}

export function CreateNasabahButton() {
	return (
		<NasabahDialog>
			<Button className="cursor-pointer">
				<PlusCircle className="w-4 h-4 mr-2" />
				Tambah Nasabah
			</Button>
		</NasabahDialog>
	);
}

export function EditNasabahButton({ customer }: { customer: Customer }) {
	return (
		<NasabahDialog customer={customer}>
			<Button variant="outline" size="sm">
				<Pencil className="w-4 h-4 mr-2" />
				Edit Profil
			</Button>
		</NasabahDialog>
	);
}
