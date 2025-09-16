"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	type NavCollapsible,
	type NavItem,
	type NavLink,
	type NavGroup as NavGroupProps,
} from "./types";

function checkIsActive(pathname: string, item: NavItem) {
	if (!item.url) {
		return !!item.items?.some((subItem) => pathname.startsWith(subItem.url));
	}

	if (item.url === "/") {
		return pathname === "/";
	}

	return pathname.startsWith(item.url);
}

export function NavGroup({ title, items }: NavGroupProps) {
	const { state, isMobile } = useSidebar();
	const pathname = usePathname();
	return (
		<SidebarGroup>
			<SidebarGroupLabel>{title}</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					const key = `${item.title}-${item.url || item.items?.[0]?.url}`;

					if (!item.items)
						return (
							<SidebarMenuLink
								key={key}
								item={item as NavLink}
								pathname={pathname}
							/>
						);

					if (state === "collapsed" && !isMobile)
						return (
							<SidebarMenuCollapsedDropdown
								key={key}
								item={item as NavCollapsible}
								pathname={pathname}
							/>
						);

					return (
						<SidebarMenuCollapsible
							key={key}
							item={item as NavCollapsible}
							pathname={pathname}
						/>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}

function NavBadge({ children }: { children: ReactNode }) {
	return <Badge className="px-1 py-0 text-xs rounded-full">{children}</Badge>;
}

function SidebarMenuLink({
	item,
	pathname,
}: {
	item: NavLink;
	pathname: string;
}) {
	const { setOpenMobile } = useSidebar();
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={checkIsActive(pathname, item)}
				tooltip={item.title}
			>
				<Link href={item.url} onClick={() => setOpenMobile(false)}>
					{item.icon && <item.icon />}
					<span>{item.title}</span>
					{item.badge && <NavBadge>{item.badge}</NavBadge>}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

function SidebarMenuCollapsible({
	item,
	pathname,
}: {
	item: NavCollapsible;
	pathname: string;
}) {
	const { setOpenMobile } = useSidebar();
	return (
		<Collapsible
			asChild
			defaultOpen={checkIsActive(pathname, item)}
			className="group/collapsible"
		>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton tooltip={item.title}>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
						{item.badge && <NavBadge>{item.badge}</NavBadge>}
						<ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{item.items.map((subItem) => (
							<SidebarMenuSubItem key={subItem.title}>
								<SidebarMenuSubButton
									asChild
									isActive={checkIsActive(pathname, subItem)}
								>
									<Link href={subItem.url} onClick={() => setOpenMobile(false)}>
										{subItem.icon && <subItem.icon />}
										<span>{subItem.title}</span>
										{subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
									</Link>
								</SidebarMenuSubButton>
							</SidebarMenuSubItem>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}

function SidebarMenuCollapsedDropdown({
	item,
	pathname,
}: {
	item: NavCollapsible;
	pathname: string;
}) {
	return (
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton
						tooltip={item.title}
						isActive={checkIsActive(pathname, item)}
					>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
						{item.badge && <NavBadge>{item.badge}</NavBadge>}
						<ChevronRight className="ms-auto" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="right" align="start" sideOffset={4}>
					<DropdownMenuLabel>
						{item.title} {item.badge ? `(${item.badge})` : ""}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{item.items.map((sub) => (
						<DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
							<Link
								href={sub.url}
								className={`${
									checkIsActive(pathname, sub) ? "bg-secondary" : ""
								}`}
							>
								{sub.icon && <sub.icon />}
								<span className="max-w-52 text-wrap">{sub.title}</span>
								{sub.badge && (
									<span className="text-xs ms-auto">{sub.badge}</span>
								)}
							</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	);
}
