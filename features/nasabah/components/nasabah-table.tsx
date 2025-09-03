"use client";

import Link from "next/link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	MoreHorizontal,
	Eye,
	ArrowDownUp,
	ShieldOff,
	Coins,
} from "lucide-react";
import { Customer } from "../types";
// import { deactivateCustomer } from '../actions'; // Akan diaktifkan saat actions.ts sudah final

// Tipe props untuk komponen tabel
interface NasabahTableProps {
	customers: Customer[];
}

// Fungsi untuk format mata uang Rupiah
const formatCurrency = (amount: number | bigint) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(amount);
};

export function NasabahTable({ customers }: NasabahTableProps) {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nama Nasabah</TableHead>
						<TableHead>Nomor Rekening</TableHead>
						<TableHead>Saldo</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>
							<span className="sr-only">Aksi</span>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{customers?.length > 0 ? (
						customers.map((customer) => (
							<TableRow key={customer.id}>
								<TableCell className="font-medium">{customer.name}</TableCell>
								<TableCell>{customer.accountNumber}</TableCell>
								<TableCell>
									{formatCurrency(Number(customer.balance))}
								</TableCell>
								<TableCell>
									<Badge
										variant={
											customer.status === "ACTIVE" ? "default" : "destructive"
										}
									>
										{customer.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
									</Badge>
								</TableCell>
								<TableCell>
									<AlertDialog>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													aria-haspopup="true"
													size="icon"
													variant="ghost"
												>
													<MoreHorizontal className="h-4 w-4" />
													<span className="sr-only">Toggle menu</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Aksi Cepat</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem asChild>
													<Link
														href={`/nasabah/${customer.id}`}
														className="flex items-center"
													>
														<Eye className="mr-2 h-4 w-4" />
														Lihat Detail
													</Link>
												</DropdownMenuItem>

												{/* TODO: Ganti dengan komponen Dialog Transaksi */}
												<DropdownMenuItem>
													<Coins className="mr-2 h-4 w-4" />
													Simpan / Tarik
												</DropdownMenuItem>
												<DropdownMenuItem>
													<ArrowDownUp className="mr-2 h-4 w-4" />
													Transfer
												</DropdownMenuItem>

												<DropdownMenuSeparator />

												{/* Trigger untuk dialog konfirmasi deaktivasi */}
												<AlertDialogTrigger asChild>
													<button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10">
														<ShieldOff className="mr-2 h-4 w-4" />
														Nonaktifkan
													</button>
												</AlertDialogTrigger>
											</DropdownMenuContent>
										</DropdownMenu>

										{/* Konten Dialog Konfirmasi Deaktivasi */}
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Nonaktifkan Nasabah?
												</AlertDialogTitle>
												<AlertDialogDescription>
													Tindakan ini akan menonaktifkan nasabah dan
													rekeningnya. Nasabah tidak akan bisa melakukan
													transaksi. Pastikan saldo nasabah adalah Rp 0.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Batal</AlertDialogCancel>
												{/* <form action={deactivateCustomer.bind(null, customer.id!)}> */}
												<form>
													<AlertDialogAction type="submit">
														Ya, Nonaktifkan
													</AlertDialogAction>
												</form>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={5}
								className="h-24 text-center text-muted-foreground"
							>
								Tidak ada data nasabah ditemukan.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
