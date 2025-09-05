"use client";

import { useState, useEffect, type ReactNode } from "react";

/**
 * Komponen wrapper untuk memastikan children hanya di-render di sisi klien.
 * Ini berguna untuk mencegah hydration mismatch error dari library pihak ketiga
 * yang menghasilkan ID acak atau bergantung pada API browser.
 */
export function ClientOnly({ children }: { children: ReactNode }) {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	if (!hasMounted) {
		return null; // Jangan render apapun di server atau saat hidrasi awal
	}

	return <>{children}</>;
}
