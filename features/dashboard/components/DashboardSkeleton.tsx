import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Komponen skeleton loader untuk halaman dashboard.
 * Menampilkan placeholder untuk kartu statistik dan grafik saat data sedang dimuat.
 */
export function DashboardSkeleton() {
	return (
		<div className="flex flex-col w-full gap-6">
			{/* Skeleton untuk Header dan Filter Tanggal */}
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<div className="flex-1 space-y-2">
					<Skeleton className="w-48 h-8" />
					<Skeleton className="h-5 w-72" />
				</div>
				<Skeleton className="h-10 w-full md:w-[490px]" />
			</div>

			{/* Skeleton untuk Kartu Statistik */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<Card key={index}>
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<Skeleton className="w-32 h-5" />
							<Skeleton className="w-4 h-4" />
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Skeleton className="w-3/4 h-8" />
								<Skeleton className="w-1/2 h-4" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Skeleton untuk Grafik */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, index) => (
					<Card key={index}>
						<CardHeader>
							<Skeleton className="w-1/3 h-6" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-[300px] w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
