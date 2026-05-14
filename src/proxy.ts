import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-contratpro-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-contratpro-search", request.nextUrl.search);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
