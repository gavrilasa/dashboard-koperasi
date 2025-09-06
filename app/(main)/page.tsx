import { Suspense } from "react";
import { endOfDay, startOfDay } from "date-fns";
import {
	getDashboardStats,
	getTransactionChartData,
	getMainAccountChartData,
} from "@/features/dashboard/data";
import { DashboardClient } from "@/features/dashboard/components/DashboardClient";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";

async function DashboardContent({
	dateRange,
}: {
	dateRange: { from: Date; to: Date };
}) {
	const [stats, transactionChartData, mainAccountChartData] = await Promise.all(
		[
			getDashboardStats(dateRange),
			getTransactionChartData(dateRange),
			getMainAccountChartData(dateRange),
		]
	);

	return (
		<DashboardClient
			stats={stats}
			transactionChartData={transactionChartData}
			mainAccountChartData={mainAccountChartData}
		/>
	);
}

export default async function HomePage({
	searchParams,
}: {
	searchParams?: Promise<{
		from?: string;
		to?: string;
	}>;
}) {
	const resolvedSearchParams = await searchParams;
	const from = resolvedSearchParams?.from
		? startOfDay(new Date(resolvedSearchParams.from))
		: startOfDay(new Date());

	const to = resolvedSearchParams?.to
		? endOfDay(new Date(resolvedSearchParams.to))
		: endOfDay(new Date());

	const suspenseKey = `${from.toISOString()}-${to.toISOString()}`;

	return (
		<Suspense key={suspenseKey} fallback={<DashboardSkeleton />}>
			<DashboardContent dateRange={{ from, to }} />
		</Suspense>
	);
}
