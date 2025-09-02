"use client"; // Tambahkan ini di baris pertama

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TopNav } from "./top-nav"; // Impor komponen TopNav

// Data placeholder untuk link navigasi di header
const topNavLinks = [
	{ title: "Overview", href: "/dashboard" },
	{ title: "Customers", href: "/dashboard/customers" },
	{ title: "Settings", href: "/dashboard/settings" },
];

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
	fixed?: boolean;
	ref?: React.Ref<HTMLElement>;
};

export function Header({ className, fixed, children, ...props }: HeaderProps) {
	const [offset, setOffset] = useState(0);

	useEffect(() => {
		// Listener untuk scroll tidak perlu diubah
		const onScroll = () => {
			setOffset(document.body.scrollTop || document.documentElement.scrollTop);
		};
		document.addEventListener("scroll", onScroll, { passive: true });
		return () => document.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"z-50 h-16",
				fixed && "header-fixed peer/header sticky top-0 w-[inherit]",
				offset > 10 && fixed ? "shadow" : "shadow-none",
				className
			)}
			{...props}
		>
			<div
				className={cn(
					"relative flex h-full items-center gap-3 p-4 sm:gap-4",
					offset > 10 &&
						fixed &&
						"after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg"
				)}
			>
				<SidebarTrigger variant="outline" className="max-md:scale-125" />
				<Separator orientation="vertical" className="h-6" />

				{/* Panggil komponen TopNav di sini */}
				<TopNav links={topNavLinks} />

				{/* 'children' masih bisa digunakan jika Anda ingin menambahkan elemen lain */}
				<div className="ml-auto flex items-center space-x-4">{children}</div>
			</div>
		</header>
	);
}
