"use client";

import Link from "next/link"; // Menggunakan Link dari Next.js
import { usePathname } from "next/navigation"; // Menggunakan hook dari Next.js
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mendefinisikan tipe untuk setiap link
type NavLink = {
	title: string;
	href: string;
	disabled?: boolean;
};

// Mendefinisikan props untuk komponen TopNav
type TopNavProps = React.HTMLAttributes<HTMLElement> & {
	links: NavLink[];
};

export function TopNav({ className, links, ...props }: TopNavProps) {
	const pathname = usePathname(); // Mendapatkan URL saat ini

	// Fungsi untuk mengecek apakah link aktif
	const isActive = (href: string) => pathname === href;

	return (
		<>
			{/* Tampilan untuk Mobile (Dropdown) */}
			<div className="lg:hidden">
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="outline" className="md:size-7">
							<Menu />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="bottom" align="start">
						{links.map(({ title, href, disabled }) => (
							<DropdownMenuItem key={`${title}-${href}`} asChild>
								<Link
									href={href}
									className={!isActive(href) ? "text-muted-foreground" : ""}
									aria-disabled={disabled}
									tabIndex={disabled ? -1 : undefined}
								>
									{title}
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Tampilan untuk Desktop (Navigasi Horizontal) */}
			<nav
				className={cn(
					"hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6",
					className
				)}
				{...props}
			>
				{links.map(({ title, href, disabled }) => (
					<Link
						key={`${title}-${href}`}
						href={href}
						aria-disabled={disabled}
						tabIndex={disabled ? -1 : undefined}
						className={cn(
							"hover:text-primary text-sm font-medium transition-colors",
							!isActive(href) && "text-muted-foreground",
							disabled && "pointer-events-none opacity-50"
						)}
					>
						{title}
					</Link>
				))}
			</nav>
		</>
	);
}
