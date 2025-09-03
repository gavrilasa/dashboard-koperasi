import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
	const isLoggedIn = !!req.auth;
	const { nextUrl } = req;

	const isAuthRoute = nextUrl.pathname.startsWith("/login");

	if (isLoggedIn && isAuthRoute) {
		return NextResponse.redirect(new URL("/", req.url));
	}
});

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
