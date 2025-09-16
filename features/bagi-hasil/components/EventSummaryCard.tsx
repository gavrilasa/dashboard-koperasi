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
					Detail utama dari event bagi hasil yang dieksekusi pada{" "}
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
						<span className="text-muted-foreground">Total Dana Dibagikan</span>
						<span className="font-semibold text-blue-600">
							{formatCurrency(event.totalAmountShared)}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Jumlah Penerima</span>
						<span className="font-medium">
							{event.numberOfRecipients} Nasabah
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Dana per Nasabah</span>
						<span className="font-semibold text-green-600">
							{formatCurrency(event.amountPerRecipient)}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
