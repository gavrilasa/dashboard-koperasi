import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchProfitSharingEventDetails } from "@/features/bagi-hasil/data";
import { EventSummaryCard } from "@/features/bagi-hasil/components/event-summary-card";
import { DataTable } from "@/components/shared/data-table";
import { recipientListColumns } from "@/features/bagi-hasil/components/recipient-list-columns";
import { TableSkeleton } from "@/components/shared/skeletons";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const metadata = {
	title: "Detail Event Bagi Hasil",
};

export default async function EventDetailPage({
	params,
	searchParams,
}: {
	params: Promise<{ eventId: string }>;
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;

	const eventId = resolvedParams.eventId;
	const currentPage = Number(resolvedSearchParams?.page) || 1;

	const eventDetails = await fetchProfitSharingEventDetails(eventId);

	if (!eventDetails) {
		notFound();
	}

	const safeEventData = {
		id: eventDetails.id,
		executedAt: eventDetails.executedAt,
		totalAmountShared: eventDetails.totalAmountShared.toNumber(),
		numberOfRecipients: eventDetails.numberOfRecipients,
		amountPerRecipient: eventDetails.amountPerRecipient.toNumber(),
		remainderAmount: eventDetails.remainderAmount.toNumber(),
	};

	const recipientData = eventDetails.recipientTransactions.map((tx) => ({
		id: tx.customer.id,
		name: tx.customer.name,
		accountNumber: tx.customer.accountNumber,
		amountReceived: tx.amount.toNumber(),
	}));

	return (
		<div className="flex flex-col w-full gap-6">
			<Link
				href="/bagi-hasil"
				className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="w-4 h-4" />
				Kembali ke Riwayat Bagi Hasil
			</Link>

			<div>
				<h1 className="text-2xl font-bold tracking-tight">Detail Bagi Hasil</h1>
				<p className="text-muted-foreground">
					Informasi lengkap bagi hasil dan daftar penerima.
				</p>
			</div>

			<EventSummaryCard event={safeEventData} />

			<Card className="shadow-lg">
				<CardHeader>
					<CardTitle>Daftar Penerima</CardTitle>
					<CardDescription>
						{eventDetails.numberOfRecipients} nasabah yang menerima bagi hasil
						pada sesi ini.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense key={currentPage} fallback={<TableSkeleton />}>
						<DataTable columns={recipientListColumns} data={recipientData} />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
