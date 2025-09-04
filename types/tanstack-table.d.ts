// types/tanstack-table.d.ts

import "@tanstack/react-table";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData extends RowData, TValue> {
		width?: string;
		align?: "left" | "center" | "right";
		truncate?: boolean;
	}
}
