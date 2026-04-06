import { Role } from "./auth";

export interface ProjectWithDescription {
  id: string;
  orgId: string;
  name: string;
  domain: string | null;
  description: string | null;
  createdAt: Date;
}

export interface SidebarProject {
  id: string;
  name: string;
}

export interface Member {
  id: string;
  userId: string | null;
  email: string;
  name: string | null;
  role: Role | string; // Using Role | string to handle polymorphic roles if needed, but primarily Role
  joinedAt: string;
  status: string;
}

export interface InviteData {
  orgName: string;
  email: string;
  role: Role;
}

export interface InviteDetails {
  invitation: {
    id: string;
    email: string;
    role: Role;
    organization: {
      name: string;
    };
  };
}
