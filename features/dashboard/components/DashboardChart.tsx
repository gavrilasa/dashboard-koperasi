"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartDataPoint } from "../types";

// ... (interface CustomTooltipProps tetap sama)
interface CustomTooltipProps {
	active?: boolean;
	payload?: { value: number }[];
	label?: string;
	formatter: (value: number) => string;
}

interface DashboardChartProps {
	title: string;
	data: ChartDataPoint[];
	isLoading: boolean;
	valueFormatter: (value: number) => string;
	chartColor: "green" | "yellow" | "primary";
	yAxisWidth?: number; // Tambahkan prop baru untuk lebar sumbu Y
}

const colorMap = {
	green: "oklch(0.6 0.18 145)",
	yellow: "oklch(0.85 0.2 90)",
	primary: "oklch(0.205 0 0)",
};

export function DashboardChart({
	title,
	data,
	isLoading,
	valueFormatter,
	chartColor,
	yAxisWidth = 60, // Beri nilai default
}: DashboardChartProps) {
	const CustomTooltip = ({
		active,
		payload,
		label,
		formatter,
	}: CustomTooltipProps) => {
		if (active && payload && payload.length) {
			return (
				<div className="p-2 text-sm bg-white border rounded-md shadow-lg">
					<p className="font-bold">{label}</p>
					<p className="text-muted-foreground">{`Value: ${formatter(
						payload[0].value
					)}`}</p>
				</div>
			);
		}
		return null;
	};

	const strokeColor = colorMap[chartColor];
	const gradientId = `color-${chartColor}`;

	const yMinDomain =
		data.length > 0
			? Math.floor(Math.min(...data.map((d) => d.value)) * 0.995)
			: 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[300px] w-full">
					{isLoading ? (
						<Skeleton className="w-full h-full" />
					) : data.length === 0 ? (
						<div className="flex items-center justify-center w-full h-full text-muted-foreground">
							Tidak ada data untuk ditampilkan pada periode ini.
						</div>
					) : (
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={data} margin={{ left: 12, right: 12 }}>
								<defs>
									<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="5%"
											stopColor={strokeColor}
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor={strokeColor}
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="label"
									tickLine={false}
									axisLine={false}
									fontSize={12}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									fontSize={12}
									tickFormatter={valueFormatter}
									domain={[yMinDomain, "auto"]}
									width={yAxisWidth} // Terapkan lebar sumbu Y di sini
								/>
								<Tooltip
									content={<CustomTooltip formatter={valueFormatter} />}
								/>
								<Area
									type="monotone"
									dataKey="value"
									stroke={strokeColor}
									strokeWidth={2}
									fillOpacity={1}
									fill={`url(#${gradientId})`}
								/>
							</AreaChart>
						</ResponsiveContainer>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
