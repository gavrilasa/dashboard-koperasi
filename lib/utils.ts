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

	return new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	}).format(dateObj);
};

// Fungsi baru untuk format tanggal DD/MM/YY
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
