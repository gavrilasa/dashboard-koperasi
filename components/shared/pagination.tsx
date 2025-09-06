"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ totalPages }: { totalPages: number }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentPage = Number(searchParams.get("page")) || 1;

	const createPageURL = (pageNumber: number) => {
		const params = new URLSearchParams(searchParams);
		params.set("page", pageNumber.toString());
		return `${pathname}?${params.toString()}`;
	};

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex items-center justify-center gap-2">
			<Button
				asChild
				variant="outline"
				size="icon"
				className="hidden w-8 h-8 sm:flex"
				disabled={currentPage <= 1}
				aria-label="Ke halaman pertama"
			>
				<Link href={createPageURL(1)}>
					<ChevronsLeft className="w-4 h-4" />
				</Link>
			</Button>

			<Button
				asChild
				variant="outline"
				size="icon"
				className="w-8 h-8"
				disabled={currentPage <= 1}
				aria-label="Ke halaman sebelumnya"
			>
				<Link href={createPageURL(currentPage - 1)}>
					<ChevronLeft className="w-4 h-4" />
				</Link>
			</Button>

			<Button
				variant="default"
				className="w-8 h-8 p-0 cursor-default"
				aria-current="page"
			>
				{currentPage}
			</Button>

			<Button
				asChild
				variant="outline"
				size="icon"
				className="w-8 h-8"
				disabled={currentPage >= totalPages}
				aria-label="Ke halaman berikutnya"
			>
				<Link href={createPageURL(currentPage + 1)}>
					<ChevronRight className="w-4 h-4" />
				</Link>
			</Button>

			<Button
				asChild
				variant="outline"
				size="icon"
				className="hidden w-8 h-8 sm:flex"
				disabled={currentPage >= totalPages}
				aria-label="Ke halaman terakhir"
			>
				<Link href={createPageURL(totalPages)}>
					<ChevronsRight className="w-4 h-4" />
				</Link>
			</Button>
		</div>
	);
}
