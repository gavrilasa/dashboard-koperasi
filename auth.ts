import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import * as argon2 from "argon2";
import type { Adapter } from "next-auth/adapters";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma) as Adapter,
	session: { strategy: "database" },
	pages: {
		signIn: "/login",
	},
	providers: [
		Credentials({
			async authorize(credentials) {
				const parsedCredentials = z
					.object({
						email: z.string().email(),
						password: z.string().min(6),
					})
					.safeParse(credentials);

				if (parsedCredentials.success) {
					const { email, password } = parsedCredentials.data;

					const user = await prisma.user.findUnique({
						where: { email },
					});

					if (!user || !user.password) return null;

					const passwordsMatch = await argon2.verify(user.password, password);

					if (passwordsMatch) {
						const { password, ...userWithoutPassword } = user;
						return userWithoutPassword;
					}
				}

				return null;
			},
		}),
	],
	callbacks: {
		session({ session, user }) {
			if (session.user && user) {
				session.user.id = user.id;
			}

			return session;
		},
	},
});
