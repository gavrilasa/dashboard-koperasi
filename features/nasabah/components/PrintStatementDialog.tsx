"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintStatementDialog({ customerId }: { customerId: string }) {
	const printUrl = `/nasabah/${customerId}/cetak`;

	return (
		<Button asChild variant="outline" size="sm">
			<Link href={printUrl} target="_blank">
				<Printer className="w-4 h-4 mr-2" />
				Cetak Rekening Koran
			</Link>
		</Button>
	);
}
