"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardProps } from "../types";

export function StatCard({
	title,
	value,
	description,
	icon: Icon,
	isLoading,
}: StatCardProps) {
	return (
		<Card className="gap-4">
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<CardTitle className="font-medium">{title}</CardTitle>
				<Icon className="w-5 h-5 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-2">
						<Skeleton className="w-3/4 h-8" />
						<Skeleton className="w-1/2 h-4" />
					</div>
				) : (
					<>
						<div className="text-2xl font-bold">{value}</div>
						<p className="mt-1 text-sm text-muted-foreground">{description}</p>
					</>
				)}
			</CardContent>
		</Card>
	);
}
