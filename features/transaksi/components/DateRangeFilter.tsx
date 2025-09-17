"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format, startOfMonth, parseISO } from "date-fns";
import { id } from "date-fns/locale";
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

	const [date, setDate] = useState<DateRange | undefined>(() => {
		const from = searchParams.get("from");
		const to = searchParams.get("to");
		if (from && to) {
			return { from: parseISO(from), to: parseISO(to) };
		}
		const today = new Date();
		return { from: startOfMonth(today), to: today };
	});

	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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
						"w-full sm:w-auto justify-start text-left font-normal whitespace-nowrap", // Perubahan di baris ini
						!date && "text-muted-foreground"
					)}
				>
					<CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />{" "}
					{/* Tambahkan flex-shrink-0 */}
					{date?.from ? (
						date.to ? (
							<>
								{format(date.from, "dd MMMM yyyy", { locale: id })} -{" "}
								{format(date.to, "dd MMMM yyyy", { locale: id })}
							</>
						) : (
							format(date.from, "dd MMMM yyyy", { locale: id })
						)
					) : (
						<span>Pilih rentang tanggal</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="center">
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
