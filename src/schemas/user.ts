import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "EMPLOYEE"], { errorMap: () => ({ message: "Role must be ADMIN or EMPLOYEE" }) }),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["ADMIN", "EMPLOYEE"], { errorMap: () => ({ message: "Role must be ADMIN or EMPLOYEE" }) }).optional(),
  status: z.enum(["ACTIVE", "DISABLED"], { errorMap: () => ({ message: "Status must be ACTIVE or DISABLED" }) }).optional(),
});

export const userSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  status: z.enum(["ACTIVE", "DISABLED"]),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

// Aliases for compatibility
export const createUserSchema = userCreateSchema;
export const updateUserSchema = userUpdateSchema;

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserType = z.infer<typeof userSchema>;
