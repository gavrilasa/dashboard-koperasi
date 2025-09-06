// app/not-found.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center w-full min-h-screen bg-background">
			<div className="flex flex-col items-center justify-center w-full h-full gap-2 m-auto">
				<h1 className="text-[7rem] font-bold leading-tight">404</h1>
				<span className="font-medium">Oops! Halaman Tidak Ditemukan!</span>
				<p className="text-center text-muted-foreground">
					Sepertinya halaman yang Anda cari tidak ada <br />
					atau mungkin telah dipindahkan.
				</p>
				<div className="flex gap-4 mt-6">
					<Button variant="outline" onClick={() => router.back()}>
						Kembali
					</Button>
					<Button asChild>
						<Link href="/">Kembali ke Beranda</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
