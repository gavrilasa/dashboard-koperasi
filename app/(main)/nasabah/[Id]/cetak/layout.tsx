// app/(main)/nasabah/[Id]/cetak/layout.tsx

export default function CetakLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// This layout simply renders its children without any of the main app's UI
	return <>{children}</>;
}
