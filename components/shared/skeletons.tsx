import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function TableSkeleton() {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nama</TableHead>
						<TableHead>Nomor KTP</TableHead>
						<TableHead className="hidden md:table-cell">Alamat</TableHead>
						<TableHead>No. Telepon</TableHead>
						<TableHead>
							<span className="sr-only">Aksi</span>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{/* Membuat 5 baris skeleton sebagai placeholder */}
					{Array.from({ length: 5 }).map((_, index) => (
						<TableRow key={index}>
							<TableCell>
								<Skeleton className="h-4 w-32" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-40" />
							</TableCell>
							<TableCell className="hidden md:table-cell">
								<Skeleton className="h-4 w-full" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-32" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-8 w-8 rounded-md" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
