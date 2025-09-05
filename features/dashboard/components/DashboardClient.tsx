"use client";

import { Banknote, Landmark, Users } from "lucide-react";
import { formatCompactCurrency } from "@/lib/utils"; // <-- Impor fungsi baru
import { StatCard } from "./StatCard";
import { DashboardChart } from "./DashboardChart";
import { DateRangeFilter } from "./DateRangeFilter";
import type { ChartDataPoint, DashboardStats } from "../types";
import { ClientOnly } from "@/components/shared/ClientOnly";

interface DashboardClientProps {
	stats: DashboardStats;
	transactionChartData: ChartDataPoint[];
	mainAccountChartData: ChartDataPoint[];
}

export function DashboardClient({
	stats,
	transactionChartData,
	mainAccountChartData,
}: DashboardClientProps) {
	const formatAsInteger = (value: number) => value.toString();

	return (
		<div className="flex flex-col w-full gap-6">
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<div className="flex-1">
					<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">
						Ringkasan data operasional koperasi.
					</p>
				</div>
				<ClientOnly>
					<DateRangeFilter />
				</ClientOnly>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<StatCard
					title="Saldo Rekening Induk"
					value={stats.mainAccountBalance}
					description="Saldo akhir pada periode terpilih"
					icon={Landmark}
					isLoading={false}
				/>
				<StatCard
					title="Total Volume Transaksi"
					value={stats.totalTransactionVolume}
					description="Total nilai transaksi pada periode ini"
					icon={Banknote}
					isLoading={false}
				/>
				<StatCard
					title="Nasabah Aktif"
					value={stats.activeCustomerCount}
					description="Total nasabah dengan status aktif"
					icon={Users}
					isLoading={false}
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<DashboardChart
					title="Jumlah Transaksi"
					data={transactionChartData}
					isLoading={false}
					valueFormatter={formatAsInteger}
					chartColor="yellow"
					yAxisWidth={30} // Beri ruang secukupnya
				/>
				<DashboardChart
					title="Tren Saldo Rekening Induk"
					data={mainAccountChartData}
					isLoading={false}
					valueFormatter={formatCompactCurrency} // Gunakan formatter ringkas
					chartColor="green"
					yAxisWidth={85} // Beri ruang lebih lebar
				/>
			</div>
		</div>
	);
}
