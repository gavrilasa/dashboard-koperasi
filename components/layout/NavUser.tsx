"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { signOutAction } from "@/lib/actions/auth-actions";

function SignOutDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Anda yakin ingin keluar dari akun ini?
					</AlertDialogTitle>
					<AlertDialogDescription>
						Sesi aktif anda akan berakhir dan akan memerlukan Masuk kembali.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="cursor-pointer">
						Batal
					</AlertDialogCancel>
					<form action={signOutAction}>
						<AlertDialogAction
							type="submit"
							className="font-medium bg-red-500 cursor-pointer hover:bg-red-600"
						>
							Keluar
						</AlertDialogAction>
					</form>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export function NavUser() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="relative w-8 h-8 rounded-full cursor-pointer"
					>
						<Avatar className="w-8 h-8">
							<AvatarImage
								src="/avatars/01.png"
								alt="admin"
								className="text-white bg-green-800"
							/>
							<AvatarFallback className="text-white bg-green-800">
								AD
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end" forceMount>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col gap-1.5">
							<p className="text-sm font-medium leading-none">Admin</p>
							<p className="text-xs leading-none text-muted-foreground">
								admin@dev.com
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setOpen(true)}
						className="cursor-pointer"
					>
						<p className="font-medium text-red-500">Sign out</p>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<SignOutDialog open={!!open} onOpenChange={setOpen} />
		</>
	);
}
