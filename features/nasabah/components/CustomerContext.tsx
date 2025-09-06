"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Customer, CustomerContextType } from "../types";

const CustomerContext = createContext<CustomerContextType | null>(null);

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

export function useCustomer() {
	const context = useContext(CustomerContext);
	if (!context) {
		throw new Error("useCustomer must be used within a CustomerProvider");
	}
	return context;
}
