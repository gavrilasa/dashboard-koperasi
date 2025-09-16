import { Suspense } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import {
	getMainAccountBalance,
	getMainAccountTransactions,
	getMainAccountTransactionPages,
} from "@/features/rekening-induk/data";
import { formatCurrency } from "@/lib/utils";
import Pagination from "@/components/shared/Pagination";
import TableSkeleton from "@/components/shared/Skeletons";
import { LedgerActionDialog } from "@/features/rekening-induk/components/LedgerActionDialog";
import { MainAccountTransaction } from "@prisma/client";

export const metadata = {
	title: "Rekening Induk",
};

const formatDateTime = (date: Date) => {
	return new Intl.DateTimeFormat("id-ID", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
};

async function MainAccountTransactionTable({
	currentPage,
}: {
	currentPage: number;
}) {
	const transactions: MainAccountTransaction[] =
		await getMainAccountTransactions(currentPage);

	return (
		<div className="border rounded-md">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[20%]">Tanggal</TableHead>
						<TableHead className="w-[20%]">No. Resi</TableHead>
						<TableHead className="w-[35%]">Deskripsi</TableHead>
						<TableHead className="w-[10%] text-center">Tipe</TableHead>
						<TableHead className="w-[15%] text-right">Jumlah</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{transactions?.length > 0 ? (
						transactions.map((tx) => (
							<TableRow key={tx.id}>
								<TableCell>{formatDateTime(tx.createdAt)}</TableCell>
								<TableCell className="truncate">{tx.receiptNumber}</TableCell>
								<TableCell className="font-medium">{tx.description}</TableCell>
								<TableCell className="text-center">
									<Badge
										variant={tx.type === "KREDIT" ? "default" : "destructive"}
									>
										{tx.type}
									</Badge>
								</TableCell>
								<TableCell
									className={`text-right font-semibold ${
										tx.type === "KREDIT" ? "text-green-600" : "text-red-600"
									}`}
								>
									{tx.type === "KREDIT" ? "+ " : "- "}
									{formatCurrency(Number(tx.amount))}
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={5} className="h-24 text-center"></TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export default async function RekeningIndukPage({
	searchParams,
}: {
	searchParams?: Promise<{
		page?: string;
	}>;
}) {
	const resolvedSearchParams = await searchParams;
	const currentPage = Number(resolvedSearchParams?.page) || 1;

	const [mainBalance, totalPages] = await Promise.all([
		getMainAccountBalance(),
		getMainAccountTransactionPages(),
	]);

	return (
		<div className="flex flex-col w-full gap-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Rekening Induk</h1>
				<p className="text-muted-foreground">
					Kelola dan pantau dana koperasi.
				</p>
			</div>

			<Card className="shadow-lg">
				<CardHeader className="flex-col sm:flex-row sm:items-center sm:justify-between">
					<CardTitle>Total Saldo Koperasi</CardTitle>
					<CardDescription>
						Total dana yang tersedia di rekening induk.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-5xl font-bold tracking-tight text-green-600">
						{formatCurrency(mainBalance)}
					</p>
					<div className="flex gap-2">
						<LedgerActionDialog type="deposit">
							<Button className="cursor-pointer">
								<PlusCircle className="w-4 h-4 mr-2" /> Top Up Saldo
							</Button>
						</LedgerActionDialog>

						<LedgerActionDialog type="withdraw">
							<Button variant="outline" className="cursor-pointer">
								<MinusCircle className="w-4 h-4 mr-2" /> Tarik Saldo
							</Button>
						</LedgerActionDialog>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Riwayat Mutasi Rekening Induk</CardTitle>
					<CardDescription>
						Daftar semua transaksi masuk dan keluar dari rekening induk.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Suspense key={currentPage} fallback={<TableSkeleton />}>
						<MainAccountTransactionTable currentPage={currentPage} />
					</Suspense>
					<div className="flex justify-center w-full">
						<Pagination totalPages={totalPages} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
