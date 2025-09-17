import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number | bigint): string => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

export const formatCompactCurrency = (amount: number): string => {
	if (Math.abs(amount) >= 1_000_000_000) {
		return `Rp ${(Math.abs(amount) / 1_000_000_000).toFixed(2)} M`;
	}
	if (Math.abs(amount) >= 1_000_000) {
		return `Rp ${(Math.abs(amount) / 1_000_000).toFixed(1)} Jt`;
	}
	if (Math.abs(amount) >= 1_000) {
		return `Rp ${(Math.abs(amount) / 1_000).toFixed(0)} Rb`;
	}
	return `Rp ${amount.toString()}`;
};

export const formatCurrencyDecimal = (amount: number | bigint): string => {
	return new Intl.NumberFormat("id-ID", {
		style: "decimal",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

export const formatDate = (date: string | number | Date): string => {
	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) {
		return "Tanggal tidak valid";
	}

	// Perbaikan di sini: 'id-ID' dipisahkan dari objek opsi
	return new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	}).format(dateObj);
};

export const formatDateShort = (date: string | number | Date): string => {
	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) {
		return "Tanggal Tidak Valid";
	}
	const day = String(dateObj.getDate()).padStart(2, "0");
	const month = String(dateObj.getMonth() + 1).padStart(2, "0");
	const year = String(dateObj.getFullYear()).slice(-2);
	return `${day}/${month}/${year}`;
};

export const formatRupiahInput = (angka: string): string => {
	if (!angka || isNaN(Number(angka))) {
		return "";
	}
	const numberString = angka.replace(/[^,\d]/g, "").toString();
	const split = numberString.split(",");
	const sisa = split[0].length % 3;
	let rupiah = split[0].substr(0, sisa);
	const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

	if (ribuan) {
		const separator = sisa ? "." : "";
		rupiah += separator + ribuan.join(".");
	}

	rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
	return rupiah === "" ? "" : "Rp " + rupiah;
};

export const parseRupiahInput = (rupiah: string): string => {
	if (!rupiah) return "";
	return rupiah.replace(/[^0-9]/g, "");
};
