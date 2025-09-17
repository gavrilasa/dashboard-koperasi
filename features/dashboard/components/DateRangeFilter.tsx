"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format, subDays, parseISO } from "date-fns";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Preset } from "../types";

export function DateRangeFilter() {
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
		const fromDate = subDays(today, 29);
		return { from: fromDate, to: today };
	});

	const [activePreset, setActivePreset] = useState<Preset | string>(
		searchParams.get("preset") || "month"
	);

	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	const updateUrlParams = useCallback(
		(selectedDate: DateRange, preset: Preset | string) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set("from", format(selectedDate.from!, "yyyy-MM-dd"));
			params.set("to", format(selectedDate.to!, "yyyy-MM-dd"));
			params.set("preset", preset);
			router.replace(`${pathname}?${params.toString()}`);
		},
		[pathname, router, searchParams]
	);

	const handlePresetChange = (preset: Preset) => {
		setActivePreset(preset);
		const today = new Date();
		let newRange: DateRange;

		if (preset === "today") {
			newRange = { from: today, to: today };
		} else if (preset === "week") {
			newRange = { from: subDays(today, 6), to: today };
		} else {
			// month
			newRange = { from: subDays(today, 29), to: today };
		}

		setDate(newRange);
		updateUrlParams(newRange, preset);
	};

	const handleApplyCustomDate = () => {
		if (date?.from && date?.to) {
			const oneYear = 365 * 24 * 60 * 60 * 1000;
			if (date.to.getTime() - date.from.getTime() > oneYear) {
				toast.warning("Rentang Tanggal Terlalu Lebar", {
					description:
						"Rentang tanggal maksimal yang diizinkan adalah 1 tahun.",
				});
				return;
			}
			setActivePreset("custom");
			updateUrlParams(date, "custom");
			setIsPopoverOpen(false);
		} else {
			toast.error("Rentang Tidak Lengkap", {
				description: "Silakan pilih tanggal mulai dan tanggal akhir.",
			});
		}
	};

	return (
		<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
			<Tabs
				value={activePreset}
				onValueChange={(value) => handlePresetChange(value as Preset)}
			>
				<TabsList>
					<TabsTrigger value="today">Hari Ini</TabsTrigger>
					<TabsTrigger value="week">Minggu Lalu</TabsTrigger>
					<TabsTrigger value="month">Bulan Lalu</TabsTrigger>
				</TabsList>
			</Tabs>

			<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"w-full sm:w-auto justify-start text-left font-normal whitespace-nowrap",
							!date && "text-muted-foreground",
							activePreset === "custom" && "border-primary ring-1 ring-primary"
						)}
					>
						<CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
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
						<Button onClick={handleApplyCustomDate} className="w-full">
							Terapkan
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
