import type { LucideIcon } from "lucide-react";

export type User = {
	name: string;
	email: string;
	avatar: string;
};

type BaseNavItem = {
	title: string;
	badge?: string;
	icon?: LucideIcon;
};

export type NavLink = BaseNavItem & {
	url: string;
	items?: never;
};

export type NavCollapsible = BaseNavItem & {
	items: NavLink[];
	url?: never;
};

export type NavItem = NavLink | NavCollapsible;

export type NavGroup = {
	title: string;
	items: NavItem[];
};
