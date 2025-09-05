"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
	title: string;
	value: number;
	description: string;
	icon: LucideIcon;
	isLoading: boolean;
}

/**
 * Komponen kartu untuk menampilkan metrik individual di dashboard.
 * Menampilkan skeleton loader saat data sedang dimuat.
 */
export function StatCard({
	title,
	value,
	description,
	icon: Icon,
	isLoading,
}: StatCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="w-4 h-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-2">
						<Skeleton className="w-3/4 h-8" />
						<Skeleton className="w-1/2 h-4" />
					</div>
				) : (
					<>
						<div className="text-2xl font-bold">{formatCurrency(value)}</div>
						<p className="text-xs text-muted-foreground">{description}</p>
					</>
				)}
			</CardContent>
		</Card>
	);
}
