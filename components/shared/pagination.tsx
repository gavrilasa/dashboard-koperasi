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

// Helper function to generate pagination numbers with ellipses
const generatePagination = (currentPage: number, totalPages: number) => {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	if (currentPage <= 3) {
		return [1, 2, 3, "...", totalPages - 1, totalPages];
	}

	if (currentPage >= totalPages - 2) {
		return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
	}

	return [
		1,
		"...",
		currentPage - 1,
		currentPage,
		currentPage + 1,
		"...",
		totalPages,
	];
};

export function Pagination({ totalPages }: { totalPages: number }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentPage = Number(searchParams.get("page")) || 1;

	const createPageURL = (pageNumber: number | string) => {
		const params = new URLSearchParams(searchParams);
		params.set("page", pageNumber.toString());
		return `${pathname}?${params.toString()}`;
	};

	const allPages = generatePagination(currentPage, totalPages);

	return (
		<div className="flex items-center justify-center space-x-2">
			<Button
				asChild
				variant="outline"
				className="hidden w-8 h-8 p-0 sm:flex"
				disabled={currentPage <= 1}
			>
				<Link href={createPageURL(1)}>
					<span className="sr-only">Halaman pertama</span>
					<ChevronsLeft className="w-4 h-4" />
				</Link>
			</Button>
			<Button
				asChild
				variant="outline"
				className="w-8 h-8 p-0"
				disabled={currentPage <= 1}
			>
				<Link href={createPageURL(currentPage - 1)}>
					<span className="sr-only">Halaman sebelumnya</span>
					<ChevronLeft className="w-4 h-4" />
				</Link>
			</Button>

			<div className="flex items-center gap-1">
				{allPages.map((page, index) => {
					if (page === "...") {
						return (
							<span key={index} className="px-2 text-muted-foreground">
								...
							</span>
						);
					}
					return (
						<Button
							key={index}
							asChild
							variant={currentPage === page ? "default" : "outline"}
							className="w-8 h-8 p-0"
						>
							<Link href={createPageURL(page)}>{page}</Link>
						</Button>
					);
				})}
			</div>

			<Button
				asChild
				variant="outline"
				className="w-8 h-8 p-0"
				disabled={currentPage >= totalPages}
			>
				<Link href={createPageURL(currentPage + 1)}>
					<span className="sr-only">Halaman berikutnya</span>
					<ChevronRight className="w-4 h-4" />
				</Link>
			</Button>
			<Button
				asChild
				variant="outline"
				className="hidden w-8 h-8 p-0 sm:flex"
				disabled={currentPage >= totalPages}
			>
				<Link href={createPageURL(totalPages)}>
					<span className="sr-only">Halaman terakhir</span>
					<ChevronsRight className="w-4 h-4" />
				</Link>
			</Button>
		</div>
	);
}
