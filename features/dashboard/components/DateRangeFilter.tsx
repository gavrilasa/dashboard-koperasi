"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
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

	const [activeDate, setActiveDate] = useState<DateRange | undefined>(() => {
		const from = searchParams.get("from");
		const to = searchParams.get("to");
		return from && to ? { from: new Date(from), to: new Date(to) } : undefined;
	});

	const [calendarDate, setCalendarDate] = useState<DateRange | undefined>(
		activeDate
	);

	const [activePreset, setActivePreset] = useState<Preset>(() => {
		const preset = searchParams.get("preset") as Preset;
		return ["today", "week", "month"].includes(preset) ? preset : "custom";
	});

	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	const updateUrlParams = useCallback(
		(selectedDate: DateRange | undefined, preset: Preset) => {
			const params = new URLSearchParams(searchParams);
			if (selectedDate?.from && selectedDate?.to) {
				const oneYear = 365 * 24 * 60 * 60 * 1000;
				if (selectedDate.to.getTime() - selectedDate.from.getTime() > oneYear) {
					toast.warning("Rentang Tanggal Terlalu Lebar", {
						description:
							"Rentang tanggal maksimal yang diizinkan adalah 1 tahun.",
					});
					return;
				}
				params.set("from", format(selectedDate.from, "yyyy-MM-dd"));
				params.set("to", format(selectedDate.to, "yyyy-MM-dd"));
				params.set("preset", preset);
			}
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
			const startOfWeek = new Date(today);
			startOfWeek.setDate(today.getDate() - today.getDay());
			newRange = { from: startOfWeek, to: today };
		} else {
			// month
			const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
			newRange = { from: startOfMonth, to: today };
		}

		setActiveDate(newRange);
		setCalendarDate(newRange);
		updateUrlParams(newRange, preset);
	};

	const handleApplyCustomDate = () => {
		if (calendarDate?.from && calendarDate?.to) {
			setActiveDate(calendarDate);
			setActivePreset("custom");
			updateUrlParams(calendarDate, "custom");
			setIsPopoverOpen(false);
		} else {
			toast.error("Rentang Tidak Lengkap", {
				description: "Silakan pilih tanggal mulai dan tanggal akhir.",
			});
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Tabs
				value={activePreset === "custom" ? "" : activePreset}
				onValueChange={(value) => handlePresetChange(value as Preset)}
			>
				<TabsList>
					<TabsTrigger value="today">Hari Ini</TabsTrigger>
					<TabsTrigger value="week">Minggu Ini</TabsTrigger>
					<TabsTrigger value="month">Bulan Ini</TabsTrigger>
				</TabsList>
			</Tabs>

			<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"w-[280px] justify-start text-left font-normal",
							!activeDate && "text-muted-foreground",
							activePreset === "custom" && "border-primary ring-1 ring-primary"
						)}
					>
						<CalendarIcon className="w-4 h-4 mr-2" />
						{activeDate?.from ? (
							activeDate.to ? (
								<>
									{format(activeDate.from, "LLL dd, y")} -{" "}
									{format(activeDate.to, "LLL dd, y")}
								</>
							) : (
								format(activeDate.from, "LLL dd, y")
							)
						) : (
							<span>Pilih tanggal kustom</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={calendarDate?.from}
						selected={calendarDate}
						onSelect={setCalendarDate}
						numberOfMonths={2}
						disabled={{ after: new Date() }}
					/>
					<div className="p-2 border-t">
						<Button onClick={handleApplyCustomDate} className="w-full">
							Apply
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
