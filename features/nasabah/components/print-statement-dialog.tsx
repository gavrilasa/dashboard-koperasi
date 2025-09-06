"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";

const formatDateForInput = (date: Date): string => {
	return date.toISOString().split("T")[0];
};

export function PrintStatementDialog({ customerId }: { customerId: string }) {
	const [isOpen, setIsOpen] = useState(false);

	const today = new Date();
	const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

	const [startDate, setStartDate] = useState(
		formatDateForInput(firstDayOfMonth)
	);
	const [endDate, setEndDate] = useState(formatDateForInput(today));

	const printUrl = `/nasabah/${customerId}/cetak?from=${startDate}&to=${endDate}`;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Printer className="w-4 h-4 mr-2" />
					Cetak Rekening Koran
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Cetak Rekening Koran</DialogTitle>
					<DialogDescription>
						Pilih rentang tanggal untuk mencetak laporan transaksi.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid items-center grid-cols-4 gap-4">
						<Label htmlFor="start-date" className="text-right">
							Dari Tanggal
						</Label>
						<Input
							id="start-date"
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="col-span-3"
						/>
					</div>
					<div className="grid items-center grid-cols-4 gap-4">
						<Label htmlFor="end-date" className="text-right">
							Sampai Tanggal
						</Label>
						<Input
							id="end-date"
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="col-span-3"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button asChild>
						<Link
							href={printUrl}
							target="_blank"
							onClick={() => setIsOpen(false)}
						>
							<Printer className="w-4 h-4 mr-2" />
							Cetak
						</Link>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
