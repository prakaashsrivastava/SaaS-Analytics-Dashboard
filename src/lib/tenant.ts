import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { TenantContext, Role } from "@/types";

export async function getTenantContext(): Promise<TenantContext> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    orgId: session.user.orgId as string,
    orgSlug: session.user.orgSlug as string,
    role: session.user.role as Role,
    userId: session.user.id as string,
  };
}
