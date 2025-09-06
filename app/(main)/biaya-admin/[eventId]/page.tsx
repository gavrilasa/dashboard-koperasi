import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchAdminFeeEventDetails } from "@/features/biaya-admin/data";
import { EventSummaryCard } from "@/features/biaya-admin/components/EventSummaryCard";
import { DataTable } from "@/components/shared/data-table";
import { affectedCustomerListColumns } from "@/features/biaya-admin/components/AffectedCustomerListColumns";
import { TableSkeleton } from "@/components/shared/skeletons";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const metadata = {
	title: "Detail Event Biaya Admin",
};

export default async function EventDetailPage({
	params,
}: {
	params: Promise<{ eventId: string }>;
}) {
	const resolvedParams = await params;
	const eventId = resolvedParams.eventId;

	const eventDetails = await fetchAdminFeeEventDetails(eventId);

	if (!eventDetails) {
		notFound();
	}

	const safeEventData = {
		id: eventDetails.id,
		executedAt: eventDetails.executedAt,
		totalAmountCollected: eventDetails.totalAmountCollected.toNumber(),
		numberOfAffectedCustomers: eventDetails.numberOfAffectedCustomers,
		amountPerCustomer: eventDetails.amountPerCustomer.toNumber(),
		description: eventDetails.description,
	};

	const affectedCustomerData = eventDetails.recipientTransactions.map((tx) => ({
		id: tx.customer.id,
		name: tx.customer.name,
		accountNumber: tx.customer.accountNumber,
		amountCharged: tx.amount.toNumber(),
	}));

	return (
		<div className="flex flex-col w-full gap-6">
			<Link
				href="/biaya-admin"
				className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="w-4 h-4" />
				Kembali ke Riwayat Biaya Admin
			</Link>

			<div>
				<h1 className="text-2xl font-bold tracking-tight">
					Detail Biaya Administrasi
				</h1>
				<p className="text-muted-foreground">
					Informasi lengkap biaya admin dan daftar nasabah yang terdampak.
				</p>
			</div>

			<EventSummaryCard event={safeEventData} />

			<Card className="shadow-lg">
				<CardHeader>
					<CardTitle>Daftar Nasabah Terdampak</CardTitle>
					<CardDescription>
						{eventDetails.numberOfAffectedCustomers} nasabah yang dikenakan
						biaya administrasi pada sesi ini.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<TableSkeleton />}>
						<DataTable
							columns={affectedCustomerListColumns}
							data={affectedCustomerData}
						/>
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
