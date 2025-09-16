import { cn } from "@/lib/utils";
import type { MainProps } from "./types";

export function Main({ fixed, className, fluid, ...props }: MainProps) {
	return (
		<main
			data-layout={fixed ? "fixed" : "auto"}
			className={cn(
				"px-4 py-6",

				fixed && "flex grow flex-col overflow-hidden",

				!fluid &&
					"@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl",
				className
			)}
			{...props}
		/>
	);
}
