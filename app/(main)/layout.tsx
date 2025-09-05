import AuthenticatedLayout from "@/components/layout/authenticated-layout";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { NavUser } from "@/components/layout/nav-user";
import { ClientOnly } from "@/components/shared/ClientOnly";

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
