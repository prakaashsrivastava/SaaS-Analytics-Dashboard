import { Role } from "@/types";

const PERMISSIONS: Record<Role, string[]> = {
  owner: [
    "invite_member",
    "remove_member",
    "create_project",
    "delete_project",
    "view_analytics",
    "change_settings",
    "upgrade_plan",
  ],
  admin: ["invite_member", "create_project", "view_analytics"],
  member: ["view_analytics"],
};

export function canDo(role: Role | string, action: string): boolean {
  const userRole = role as Role;
  return PERMISSIONS[userRole]?.includes(action) ?? false;
}
