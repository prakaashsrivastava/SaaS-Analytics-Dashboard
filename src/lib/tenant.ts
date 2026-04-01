import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export interface TenantContext {
  orgId: string;
  orgSlug: string;
  role: string;
  userId: string;
}

export async function getTenantContext(): Promise<TenantContext> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  // NextAuth 4 augmented session types (orgId, etc.) should be in scope
  return {
    orgId: session.user.orgId as string,
    orgSlug: session.user.orgSlug as string,
    role: session.user.role as string,
    userId: session.user.id as string,
  };
}
