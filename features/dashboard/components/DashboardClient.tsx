"use client";

import { Banknote, Landmark, Users, ArrowDownUp } from "lucide-react";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";
import { StatCard } from "./StatCard";
import { DashboardChart } from "./DashboardChart";
import { DateRangeFilter } from "./DateRangeFilter";
import ClientOnly from "@/components/shared/ClientOnly";
import { DashboardClientProps } from "../types";

export default function DashboardClient({
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

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{" "}
				<StatCard
					title="Saldo Rekening Induk"
					value={formatCurrency(stats.mainAccountBalance)}
					description="Saldo akhir pada periode terpilih"
					icon={Landmark}
					isLoading={false}
				/>
				<StatCard
					title="Total Volume Transaksi"
					value={formatCurrency(stats.totalTransactionVolume)}
					description="Total nilai transaksi pada periode ini"
					icon={Banknote}
					isLoading={false}
				/>
				<StatCard
					title="Jumlah Transaksi"
					value={String(stats.totalTransactionCount)}
					description="Total transaksi pada periode ini"
					icon={ArrowDownUp}
					isLoading={false}
				/>
				<StatCard
					title="Nasabah Aktif"
					value={String(stats.activeCustomerCount)}
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
					yAxisWidth={30}
				/>
				<DashboardChart
					title="Tren Saldo Rekening Induk"
					data={mainAccountChartData}
					isLoading={false}
					valueFormatter={formatCompactCurrency}
					chartColor="green"
					yAxisWidth={85}
				/>
			</div>
		</div>
	);
}
