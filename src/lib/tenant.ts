import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type AuthenticatedUserResult =
  | { userId: string }
  | { response: NextResponse };

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUserResult> {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return {
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  return { userId: session.user.id };
}
