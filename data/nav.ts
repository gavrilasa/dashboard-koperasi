import { NavGroup } from "@/components/layout/types";
import {
	LayoutDashboard,
	Users,
	Landmark,
	CreditCard,
	Settings,
	HandCoins,
	CirclePercent,
} from "lucide-react";

export const navData: NavGroup[] = [
	{
		title: "Menu",
		items: [
			{
				title: "Dashboard",
				url: "/",
				icon: LayoutDashboard,
			},
			{
				title: "Rekening Induk",
				url: "/rekening-induk",
				icon: Landmark,
			},
			{
				title: "Nasabah",
				url: "/nasabah",
				icon: Users,
			},
			{
				title: "Riwayat Transaksi",
				url: "/transaksi",
				icon: CreditCard,
			},
			{
				title: "Bagi Hasil",
				url: "/bagi-hasil",
				icon: HandCoins,
			},
			{
				title: "Biaya Admin",
				url: "/biaya-admin",
				icon: CirclePercent,
			},
		],
	},
	{
		title: "Pengaturan",
		items: [
			{
				title: "Sistem",
				url: "/pengaturan",
				icon: Settings,
			},
		],
	},
];
