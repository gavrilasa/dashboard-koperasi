import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EventSummaryCardProps } from "../types";

export function EventSummaryCard({ event }: EventSummaryCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Ringkasan Event</CardTitle>
				<CardDescription>
					Detail utama dari event biaya administrasi yang dieksekusi pada{" "}
					{formatDate(event.executedAt)}.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Tanggal Eksekusi</span>
						<span className="font-medium">{formatDate(event.executedAt)}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Total Dana Terkumpul</span>
						<span className="font-semibold text-blue-600">
							{formatCurrency(event.totalAmountCollected)}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Jumlah Nasabah</span>
						<span className="font-medium">
							{event.numberOfAffectedCustomers} Nasabah
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Biaya per Nasabah</span>
						<span className="font-semibold text-red-600">
							{formatCurrency(event.amountPerCustomer)}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
