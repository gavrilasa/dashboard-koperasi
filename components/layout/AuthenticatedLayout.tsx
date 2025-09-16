"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import type { AuthenticatedLayoutProps } from "./types";

export default function AuthenticatedLayout({
	children,
}: AuthenticatedLayoutProps) {
	const defaultOpen = true;

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<SidebarInset className={cn("@container/content")}>
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
