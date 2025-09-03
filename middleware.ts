import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
	const isLoggedIn = !!req.auth;
	const { nextUrl } = req;

	if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
		return NextResponse.redirect(new URL("/dashboard", nextUrl));
	}
});

export const config = {
	matcher: ["/dashboard/:path*", "/login"],
};
