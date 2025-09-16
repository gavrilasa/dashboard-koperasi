import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Header } from "@/components/layout/Header";
import { Main } from "@/components/layout/Main";
import { NavUser } from "@/components/layout/NavUser";
import ClientOnly from "@/components/shared/ClientOnly";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthenticatedLayout>
			<Header>
				<ClientOnly>
					<NavUser />
				</ClientOnly>
			</Header>
			<Main>{children}</Main>
		</AuthenticatedLayout>
	);
}
