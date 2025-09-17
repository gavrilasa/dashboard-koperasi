"use client";

import { useState } from "react";
import Link from "next/link";
import { format, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
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
import { Calendar } from "@/components/ui/calendar";
import { Printer } from "lucide-react";

export function PrintTransactionDialog() {
	const [isOpen, setIsOpen] = useState(false);
	const today = new Date();
	const firstDayOfMonth = startOfMonth(today);

	const [date, setDate] = useState<DateRange | undefined>({
		from: firstDayOfMonth,
		to: today,
	});

	const printUrl = `/transaksi/cetak?from=${
		date?.from ? format(date.from, "yyyy-MM-dd") : ""
	}&to=${date?.to ? format(date.to, "yyyy-MM-dd") : ""}`;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<Printer className="w-4 h-4 mr-2" />
					Cetak Laporan
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-min">
				<DialogHeader>
					<DialogTitle>Cetak Laporan Transaksi</DialogTitle>
					<DialogDescription>
						Pilih rentang tanggal untuk mencetak laporan.
					</DialogDescription>
				</DialogHeader>
				<div className="flex justify-center">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={setDate}
						numberOfMonths={2}
						disabled={{ after: new Date() }}
					/>
				</div>
				<DialogFooter>
					<Button
						asChild
						disabled={!date?.from || !date?.to}
						className="cursor-pointer"
					>
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
