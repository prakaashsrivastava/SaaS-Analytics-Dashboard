import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export interface TenantContext {
  orgId: string;
  orgSlug: string;
  role: string;
  userId: string;
}

export async function getTenantContext(req?: Request): Promise<TenantContext> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    orgId: session.user.orgId as string,
    orgSlug: session.user.orgSlug as string,
    role: session.user.role as string,
    userId: session.user.id as string,
  };
}
