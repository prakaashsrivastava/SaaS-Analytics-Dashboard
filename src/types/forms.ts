import * as z from "zod";

// Register form schema and type
export const registerSchema = z.object({
  orgName: z.string().min(2, "Organisation name must be at least 2 characters"),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterValues = z.infer<typeof registerSchema>;

// Login form schema and type
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

// Accept invite form schema and type
export const acceptSchema = z.object({
  token: z.string(),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AcceptValues = z.infer<typeof acceptSchema>;

// Request invitation schema
export const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.string(), // Custom validation can be added for Role union if needed
});

export type InviteValues = z.infer<typeof inviteSchema>;

// Project creation schema
export const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  domain: z.string().optional(),
  description: z.string().optional(),
});

export type ProjectValues = z.infer<typeof projectSchema>;
