export type Role = "owner" | "admin" | "member";

export interface TenantContext {
  orgId: string;
  orgSlug: string;
  role: Role;
  userId: string;
}
