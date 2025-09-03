"use client";

import { SearchIcon } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";

/**
 * Komponen input pencarian yang memperbarui parameter 'query' di URL.
 * Didesain untuk digunakan di Server Pages yang membaca 'searchParams'.
 */
export function Search({ placeholder }: { placeholder: string }) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { replace } = useRouter();

	// Gunakan useDebouncedCallback untuk menunda eksekusi handleSearch
	// Ini mencegah pemanggilan database pada setiap ketikan
	const handleSearch = useDebouncedCallback((term: string) => {
		console.log(`Searching for... ${term}`);

		const params = new URLSearchParams(searchParams);

		// Reset ke halaman pertama setiap kali ada query pencarian baru
		params.set("page", "1");

		if (term) {
			params.set("query", term);
		} else {
			params.delete("query");
		}

		// Ganti URL saat ini dengan URL yang baru termasuk query pencarian
		replace(`${pathname}?${params.toString()}`);
	}, 300); // Tunda 300ms

	return (
		<div className="relative flex-1 md:grow-0">
			<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder={placeholder}
				className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
				onChange={(e) => {
					handleSearch(e.target.value);
				}}
				// Pastikan input menampilkan query dari URL saat halaman dimuat
				defaultValue={searchParams.get("query")?.toString()}
			/>
		</div>
	);
}
