import { NextResponse } from "next/server";

import { getCurrentUser, getRequestOrganizationId } from "@/server/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    organizationId: await getRequestOrganizationId(),
    user: {
      email: user.email,
      id: user.id,
    },
  });
}
