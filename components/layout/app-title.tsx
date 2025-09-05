"use client";

import Link from "next/link";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function AppTitle() {
	const { setOpenMobile } = useSidebar();
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="justify-center gap-0 py-2 hover:bg-transparent active:bg-transparent"
					asChild
				>
					<div>
						<Link
							href="/"
							onClick={() => setOpenMobile(false)}
							className="flex items-center justify-center"
						>
							<Image
								src="/LogoKoperasi.png"
								width={100}
								height={20}
								alt="Logo Koperasi"
								className="object-contain h-auto max-w-full"
							/>
						</Link>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
