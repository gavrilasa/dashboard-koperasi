"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	SidebarRail,
} from "@/components/ui/sidebar";
import { navData } from "@/data/nav";
import { NavGroup } from "./nav-group";
import { AppTitle } from "./app-title";
import { NavUser } from "./nav-user";

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

			<SidebarFooter>
				<NavUser />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
