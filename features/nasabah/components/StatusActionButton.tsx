"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShieldOff, UserCheck, Loader2 } from "lucide-react";
import {
	activateCustomer,
	deactivateCustomer,
} from "@/features/nasabah/actions";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusActionButtonProps } from "../types";

export function StatusActionButton({ customer }: StatusActionButtonProps) {
	const [isPending, startTransition] = useTransition();

	const handleAction = () => {
		startTransition(async () => {
			const actionToCall =
				customer.status === "ACTIVE" ? deactivateCustomer : activateCustomer;

			const result = await actionToCall(customer.id);

			if (result && result.status === "error") {
				toast.error("Aksi Gagal", {
					description: result.message,
				});
			} else if (result && result.status === "success") {
				const successMessage =
					customer.status === "ACTIVE"
						? `Nasabah ${customer.name} berhasil dinonaktifkan.`
						: `Nasabah ${customer.name} berhasil diaktifkan dan kini dapat menerima setoran.`;
				toast.success("Aksi Berhasil", {
					description: successMessage,
				});
			}
		});
	};

	const isActive = customer.status === "ACTIVE";

	const dialogDetails = {
		trigger: {
			variant: isActive
				? "destructive"
				: ("default" as "destructive" | "default"),
			icon: isActive ? ShieldOff : UserCheck,
			text: isActive ? "Nonaktifkan" : "Aktifkan",
		},
		title: `Anda yakin ingin ${
			isActive ? "menonaktifkan" : "mengaktifkan"
		} nasabah ini?`,
		description: isActive
			? `Tindakan ini akan membuat nasabah "${customer.name}" tidak dapat melakukan transaksi apapun. Anda dapat mengaktifkan kembali nasabah ini nanti.`
			: `Nasabah "${customer.name}" akan diaktifkan kembali dan dapat melakukan transaksi seperti biasa.`,
		action: {
			text: `Ya, ${isActive ? "Nonaktifkan" : "Aktifkan"}`,
			className: isActive
				? "bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
				: "cursor-pointer",
		},
	} as const;

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant={dialogDetails.trigger.variant}
					size="sm"
					disabled={isPending}
					className="cursor-pointer"
				>
					<dialogDetails.trigger.icon className="w-4 h-4 mr-2" />
					{dialogDetails.trigger.text}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{dialogDetails.title}</AlertDialogTitle>
					<AlertDialogDescription>
						{dialogDetails.description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Batal</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleAction}
						disabled={isPending}
						className={dialogDetails.action.className}
					>
						{isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
						{dialogDetails.action.text}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
