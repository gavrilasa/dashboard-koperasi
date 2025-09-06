import type { LucideIcon } from "lucide-react";

export type DashboardStats = {
	mainAccountBalance: number;
	activeCustomerCount: number;
	totalTransactionVolume: number;
};

export type ChartDataPoint = {
	label: string;
	value: number;
};

export interface CustomTooltipProps {
	active?: boolean;
	payload?: { value: number }[];
	label?: string;
	formatter: (value: number) => string;
}

export interface DashboardChartProps {
	title: string;
	data: ChartDataPoint[];
	isLoading: boolean;
	valueFormatter: (value: number) => string;
	chartColor: "green" | "yellow" | "primary";
	yAxisWidth?: number;
}

export interface DashboardClientProps {
	stats: DashboardStats;
	transactionChartData: ChartDataPoint[];
	mainAccountChartData: ChartDataPoint[];
}

export type Preset = "today" | "week" | "month" | "custom";

export interface StatCardProps {
	title: string;
	value: number;
	description: string;
	icon: LucideIcon;
	isLoading: boolean;
}
