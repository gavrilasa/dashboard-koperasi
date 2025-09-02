// path: data/nav.ts
import { NavGroup } from "@/components/layout/types";
import {
	LayoutDashboard,
	Users,
	Landmark,
	CreditCard,
	Settings,
} from "lucide-react";

export const navData: NavGroup[] = [
	{
		title: "Menu Utama",
		items: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: LayoutDashboard,
			},
			{
				title: "Nasabah",
				url: "/dashboard/customers",
				icon: Users,
			},
			{
				title: "Rekening",
				url: "/dashboard/accounts",
				icon: Landmark,
			},
			{
				title: "Transaksi",
				url: "/dashboard/transactions",
				icon: CreditCard,
			},
		],
	},
	{
		title: "Pengaturan",
		items: [
			{
				title: "Sistem",
				url: "/dashboard/settings",
				icon: Settings,
			},
		],
	},
];
