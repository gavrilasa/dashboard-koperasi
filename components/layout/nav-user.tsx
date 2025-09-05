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
						Are you sure you want to sign out?
					</AlertDialogTitle>
					<AlertDialogDescription>
						You will be returned to the login page.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<form action={signOutAction} className="w-full">
						<AlertDialogAction type="submit" className="w-full">
							Sign Out
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
