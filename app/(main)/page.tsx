import { Suspense } from "react";
import { redirect } from "next/navigation";
import { endOfDay, startOfDay, format, subDays } from "date-fns"; // Impor subDays
import {
	getDashboardStats,
	getTransactionChartData,
	getMainAccountChartData,
} from "@/features/dashboard/data";
import DashboardClient from "@/features/dashboard/components/DashboardClient";
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
		preset?: string;
	}>;
}) {
	const resolvedSearchParams = await searchParams;

	if (
		!resolvedSearchParams?.from &&
		!resolvedSearchParams?.to &&
		!resolvedSearchParams?.preset
	) {
		const toDate = new Date();
		const fromDate = subDays(toDate, 29);
		redirect(
			`/?from=${format(fromDate, "yyyy-MM-dd")}&to=${format(
				toDate,
				"yyyy-MM-dd"
			)}&preset=month`
		);
	}

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
