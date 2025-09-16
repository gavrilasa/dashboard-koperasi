"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format, startOfMonth, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

export function TransactionDateRangeFilter() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Inisialisasi state dari URL search params, bukan dengan nilai default baru
	const [date, setDate] = useState<DateRange | undefined>(() => {
		const from = searchParams.get("from");
		const to = searchParams.get("to");
		if (from && to) {
			return { from: parseISO(from), to: parseISO(to) };
		}
		// Jika tidak ada di URL, gunakan default bulan ini (akan disinkronkan oleh page.tsx)
		const today = new Date();
		return { from: startOfMonth(today), to: today };
	});

	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	// Fungsi ini hanya akan dipanggil saat tombol "Terapkan" ditekan
	const handleApplyDate = useCallback(() => {
		if (date?.from && date?.to) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("from", format(date.from, "yyyy-MM-dd"));
			params.set("to", format(date.to, "yyyy-MM-dd"));
			router.replace(`${pathname}?${params.toString()}`);
			setIsPopoverOpen(false);
		} else {
			toast.error("Rentang Tidak Lengkap", {
				description: "Silakan pilih tanggal mulai dan tanggal akhir.",
			});
		}
	}, [date, pathname, router, searchParams]);

	return (
		<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
			<PopoverTrigger asChild>
				<Button
					id="date"
					variant={"outline"}
					className={cn(
						"w-[280px] justify-start text-left font-normal",
						!date && "text-muted-foreground"
					)}
				>
					<CalendarIcon className="w-4 h-4 mr-2" />
					{date?.from ? (
						date.to ? (
							<>
								{format(date.from, "LLL dd, y")} -{" "}
								{format(date.to, "LLL dd, y")}
							</>
						) : (
							format(date.from, "LLL dd, y")
						)
					) : (
						<span>Pilih rentang tanggal</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					initialFocus
					mode="range"
					defaultMonth={date?.from}
					selected={date}
					onSelect={setDate}
					numberOfMonths={2}
					disabled={{ after: new Date() }}
				/>
				<div className="p-2 border-t">
					<Button onClick={handleApplyDate} className="w-full">
						Terapkan
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
