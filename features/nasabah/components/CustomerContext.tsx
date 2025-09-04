"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Customer } from "../types";

// Tipe untuk nilai yang akan disediakan oleh context
interface CustomerContextType {
	customer: Customer;
}

// Buat context dengan nilai default null
const CustomerContext = createContext<CustomerContextType | null>(null);

/**
 * Komponen Provider untuk membungkus komponen yang memerlukan akses
 * ke data nasabah tertentu.
 */
export function CustomerProvider({
	children,
	customer,
}: {
	children: ReactNode;
	customer: Customer;
}) {
	return (
		<CustomerContext.Provider value={{ customer }}>
			{children}
		</CustomerContext.Provider>
	);
}

/**
 * Custom hook untuk mengakses data nasabah dari dalam CustomerProvider.
 * Akan melempar error jika digunakan di luar provider.
 */
export function useCustomer() {
	const context = useContext(CustomerContext);
	if (!context) {
		throw new Error("useCustomer must be used within a CustomerProvider");
	}
	return context;
}
