import React from "react";
import { Member } from "./models";
import { Role } from "./auth";

export interface SidebarProps {
  orgSlug: string;
  orgName: string;
  logoUrl?: string | null;
  userRole: Role | string;
  plan: string;
}

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
}

export interface MemberTableProps {
  members: Member[];
  currentUserId?: string;
  canDelete: boolean;
  onDeleteItem: (id: string, isInvite: boolean) => void;
}

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ProjectLimitButtonProps {
  orgSlug: string;
  isLimited: boolean;
  canCreate: boolean;
}

export interface RoleBadgeProps {
  role: Role | string;
}

export interface UserAvatarProps {
  name?: string | null;
  email: string;
  className?: string;
}

export interface DashboardActionsProps {
  slug: string;
  canInvite: boolean;
  canSettings: boolean;
}

export interface AccessControlProps {
  action: string;
  children: React.ReactNode;
}

export interface InviteStatusViewProps {
  status: "invalid" | "expired" | "accepted";
}

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface AcceptInviteFormProps {
  token: string;
  orgName: string;
  email: string;
  role: Role | string;
  userExists?: boolean;
  userName?: string | null;
}

export interface TrackingGuideProps {
  projectId: string;
}

export interface ProjectAnalyticsProps {
  projectId: string;
  orgPlan: string;
}

export interface OrgSettingsFormProps {
  organisation: {
    id: string;
    name: string;
    timezone: string;
    logoUrl?: string | null;
  };
}
