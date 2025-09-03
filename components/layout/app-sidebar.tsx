"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter, // Hapus atau biarkan kosong
	SidebarRail,
} from "@/components/ui/sidebar";
import { navData } from "@/data/nav";
import { NavGroup } from "./nav-group";
import { AppTitle } from "./app-title";

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>
				<AppTitle />
			</SidebarHeader>

			<SidebarContent>
				{navData.map((group) => (
					<NavGroup key={group.title} {...group} />
				))}
			</SidebarContent>

			<SidebarFooter />

			<SidebarRail />
		</Sidebar>
	);
}
