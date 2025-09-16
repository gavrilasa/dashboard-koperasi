"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { HeaderProps } from "./types";

export function Header({ className, fixed, children, ...props }: HeaderProps) {
	const [offset, setOffset] = useState(0);

	useEffect(() => {
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
				<SidebarTrigger
					variant="outline"
					className="cursor-pointer max-md:scale-125"
				/>
				<div className="flex items-center ml-auto space-x-4">{children}</div>
			</div>
		</header>
	);
}
