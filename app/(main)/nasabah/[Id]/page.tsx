// app/(main)/nasabah/[id]/page.tsx

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCustomerById } from "@/features/nasabah/data";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	ArrowUpCircle,
	ArrowDownCircle,
	ShieldOff,
	UserCheck,
	Printer,
} from "lucide-react";
import { TableSkeleton } from "@/components/shared/skeletons";
import { TransactionHistory } from "@/features/nasabah/components/transaction-history";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EditNasabahButton } from "@/features/nasabah/components/nasabah-dialogs";
import { PrintStatementDialog } from "@/features/nasabah/components/print-statement-dialog";

export default async function NasabahDetailPage({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams?: { page?: string };
}) {
	const id = params.id;
	const currentPage = Number(searchParams?.page) || 1;

	const customer = await fetchCustomerById(id);

	if (!customer) {
		notFound();
	}

	return (
		<div className="flex flex-col w-full gap-4">
			<Link
				href="/nasabah"
				className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="w-4 h-4" />
				Kembali ke Daftar Nasabah
			</Link>

			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<div className="flex items-center gap-3">
								<CardTitle className="text-2xl">{customer.name}</CardTitle>
								<Badge
									variant={
										customer.status === "ACTIVE" ? "default" : "destructive"
									}
								>
									{customer.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
								</Badge>
							</div>
							<CardDescription>
								Detail informasi dan saldo nasabah.
							</CardDescription>
						</div>
						<div className="flex flex-shrink-0 gap-2">
							<EditNasabahButton customer={customer} />
							<PrintStatementDialog customerId={customer.id} />
							{customer.status === "ACTIVE" ? (
								<Button variant="destructive" size="sm">
									<ShieldOff className="w-4 h-4 mr-2" /> Nonaktifkan
								</Button>
							) : (
								<Button size="sm">
									<UserCheck className="w-4 h-4 mr-2" /> Aktifkan
								</Button>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						<div className="md:col-span-1">
							<div className="flex flex-col justify-between p-6 text-white shadow-lg h-52 rounded-xl bg-gradient-to-br from-green-600 to-gray-900">
								<div>
									<p className="font-mono text-lg tracking-wider">
										{customer.accountNumber}
									</p>
								</div>
								<div>
									<p className="text-xl font-medium">{customer.name}</p>
								</div>
							</div>
						</div>

						{/* Kolom Kanan: Detail Informasi */}
						<div className="md:col-span-2">
							<div className="space-y-4">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div>
										<strong>Nama:</strong> {customer.name}
									</div>
									<div>
										<strong>Nomor Rekening:</strong> {customer.accountNumber}
									</div>
									<div>
										<strong>NIK:</strong> {customer.idNumber}
									</div>
									<div>
										<strong>Jenis Kelamin:</strong>{" "}
										{customer.gender === "MALE" ? "Laki-laki" : "Perempuan"}
									</div>
									<div>
										<strong>Tanggal Lahir:</strong>{" "}
										{formatDate(customer.birthDate)}
									</div>
									<div>
										<strong>No. Telepon:</strong> {customer.phone}
									</div>
									<div className="sm:col-span-2">
										<strong>Alamat:</strong> {customer.address}
									</div>
								</div>

								<div className="p-4 border rounded-lg bg-muted">
									<p className="text-sm text-muted-foreground">Total Saldo</p>
									<p className="text-2xl font-bold">
										{formatCurrency(customer.balance)}
									</p>
								</div>

								<div className="flex gap-2 mt-4">
									<Button>
										<ArrowUpCircle className="w-4 h-4 mr-2" /> Simpan Tunai
									</Button>
									<Button variant="outline">
										<ArrowDownCircle className="w-4 h-4 mr-2" /> Tarik Tunai
									</Button>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Kartu Riwayat Transaksi (menggantikan Tabs) */}
			<Card>
				<CardHeader>
					<CardTitle>Riwayat Transaksi</CardTitle>
					<CardDescription>
						Daftar semua transaksi yang tercatat untuk nasabah ini.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense key={currentPage} fallback={<TableSkeleton />}>
						<TransactionHistory
							customerId={customer.id}
							currentPage={currentPage}
						/>
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
