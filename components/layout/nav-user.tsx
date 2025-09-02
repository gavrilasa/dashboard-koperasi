"use client";

import Link from "next/link"; // Menggunakan Link dari Next.js
import {
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Settings, // Mengganti ikon yang tidak relevan
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

// Data pengguna statis untuk placeholder
const user = {
	name: "Admin Koperasi",
	email: "admin@koperasi.dev",
	avatar: "/avatars/placeholder.png", // Anda bisa menambahkan gambar placeholder di folder public
};

export function NavUser() {
	const { isMobile } = useSidebar();

	// Fungsi logout bisa ditambahkan di sini nanti
	const handleSignOut = () => {
		// TODO: Implement logout logic
		alert("Fungsi logout belum diimplementasikan.");
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback className="rounded-lg">AK</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-start text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ms-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback className="rounded-lg">AK</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-start text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link href="/dashboard/settings">
									<Settings />
									Pengaturan
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/dashboard/billing">
									<CreditCard />
									Tagihan
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/dashboard/notifications">
									<Bell />
									Notifikasi
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut}>
							<LogOut />
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
