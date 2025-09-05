// app/(main)/bagi-hasil/[eventId]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchProfitSharingEventDetails } from "@/features/bagi-hasil/data";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { EventSummaryCard } from "@/features/bagi-hasil/components/event-summary-card";
import { recipientListColumns } from "@/features/bagi-hasil/components/recipient-list-columns";

export const metadata = {
	title: "Detail Bagi Hasil",
};

interface BagiHasilDetailPageProps {
	params: { eventId: string };
}

export default async function BagiHasilDetailPage({
	params,
}: BagiHasilDetailPageProps) {
	const eventId = params.eventId;
	const eventDetails = await fetchProfitSharingEventDetails(eventId);

	if (!eventDetails) {
		notFound();
	}

	const recipients = eventDetails.recipientTransactions.map((tx) => ({
		...tx.customer,
		amountReceived: tx.amount.toNumber(),
	}));

	const safeEventSummary = {
		...eventDetails,
		totalAmountShared: eventDetails.totalAmountShared.toNumber(),
		amountPerRecipient: eventDetails.amountPerRecipient.toNumber(),
		remainderAmount: eventDetails.remainderAmount.toNumber(),
	};

	return (
		<div className="flex flex-col w-full gap-4">
			<Link
				href="/bagi-hasil"
				className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="w-4 h-4" />
				Kembali ke Riwayat Bagi Hasil
			</Link>

			<EventSummaryCard event={safeEventSummary} />

			<Card>
				<CardHeader>
					<CardTitle>Daftar Nasabah Penerima</CardTitle>
					<CardDescription>
						Berikut adalah daftar semua nasabah yang menerima dana dari event
						bagi hasil ini.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DataTable columns={recipientListColumns} data={recipients} />
				</CardContent>
			</Card>
		</div>
	);
}
