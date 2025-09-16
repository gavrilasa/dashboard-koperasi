import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function TableSkeleton() {
	return (
		<div className="border rounded-md">
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
					{Array.from({ length: 5 }).map((_, index) => (
						<TableRow key={index}>
							<TableCell>
								<Skeleton className="w-32 h-4" />
							</TableCell>
							<TableCell>
								<Skeleton className="w-40 h-4" />
							</TableCell>
							<TableCell className="hidden md:table-cell">
								<Skeleton className="w-full h-4" />
							</TableCell>
							<TableCell>
								<Skeleton className="w-32 h-4" />
							</TableCell>
							<TableCell>
								<Skeleton className="w-8 h-8 rounded-md" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
