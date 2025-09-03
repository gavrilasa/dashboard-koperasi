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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Coins, Edit, ShieldOff, UserCheck } from "lucide-react";
import { TableSkeleton } from "@/components/shared/skeletons";
import { TransactionHistory } from "@/features/nasabah/components/transaction-history";

// Fungsi utilitas untuk format mata uang
const formatCurrency = (amount: number | bigint) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(amount);
};

// Fungsi utilitas untuk format tanggal
const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat("id-ID", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(date);
};

export default async function NasabahDetailPage({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams?: { page?: string };
}) {
	const id = params.id;
	const currentPage = Number(searchParams?.page) || 1;

	// Mengambil data profil nasabah dari server
	const customer = await fetchCustomerById(id);

	// Jika nasabah tidak ditemukan, tampilkan halaman 404
	if (!customer) {
		notFound();
	}

	return (
		<div className="flex w-full flex-col gap-4">
			<Link
				href="/nasabah"
				className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="h-4 w-4" />
				Kembali ke Daftar Nasabah
			</Link>

			{/* Kartu Profil Utama */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-4">
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
								Nomor Rekening: {customer.accountNumber}
							</CardDescription>
						</div>
						{/* Tombol Aksi di Header */}
						<div className="flex gap-2">
							{/* TODO: Ganti dengan Dialog Aksi Edit Profil */}
							<Button variant="outline" size="sm">
								<Edit className="mr-2 h-4 w-4" /> Edit Profil
							</Button>

							{/* TODO: Ganti dengan Dialog Aksi Aktifkan/Nonaktifkan */}
							{customer.status === "ACTIVE" ? (
								<Button variant="destructive" size="sm">
									<ShieldOff className="mr-2 h-4 w-4" /> Nonaktifkan
								</Button>
							) : (
								<Button size="sm">
									<UserCheck className="mr-2 h-4 w-4" /> Aktifkan
								</Button>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Detail Informasi Nasabah */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div>
							<strong>Nomor KTP:</strong> {customer.idNumber}
						</div>
						<div>
							<strong>Jenis Kelamin:</strong>{" "}
							{customer.gender === "MALE" ? "Laki-laki" : "Perempuan"}
						</div>
						<div>
							<strong>Tanggal Lahir:</strong> {formatDate(customer.birthDate)}
						</div>
						<div className="md:col-span-2">
							<strong>Alamat:</strong> {customer.address}
						</div>
						<div>
							<strong>No. Telepon:</strong> {customer.phone}
						</div>
						<div className="md:col-span-3 text-xl font-bold">
							Saldo: {formatCurrency(Number(customer.balance))}
						</div>
					</div>
					{/* Tombol Aksi Transaksi */}
					<div className="mt-4 flex gap-2">
						{/* TODO: Ganti dengan Dialog Aksi Simpan/Tarik */}
						<Button>
							<Coins className="mr-2 h-4 w-4" /> Simpan / Tarik
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Tabs untuk Riwayat Transaksi */}
			<Tabs defaultValue="transactions">
				<TabsList>
					<TabsTrigger value="transactions">Riwayat Transaksi</TabsTrigger>
				</TabsList>
				<TabsContent value="transactions">
					<Card>
						<CardHeader>
							<CardTitle>Riwayat Transaksi</CardTitle>
							<CardDescription>
								Daftar semua transaksi yang tercatat untuk nasabah ini.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Suspense untuk menangani loading state dari data transaksi */}
							<Suspense key={currentPage} fallback={<TableSkeleton />}>
								<TransactionHistory
									customerId={customer.id}
									currentPage={currentPage}
								/>
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
