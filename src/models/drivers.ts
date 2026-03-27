import { ObjectId } from "mongodb";
import { z } from "zod";

export type DriverRole = 'viewer' | 'creator' | 'admin';
export type DriverStatus = 'active' | 'suspended';

export interface Drivers {

    _id?: ObjectId;
    name: string;
    email: string;
    hashedPassword?: string;
    role: DriverRole;
    status: DriverStatus;
    racingNumber: number;
    nationality: string;
    driverImage?: string;
    driverTeam: string;
    driverDES?: string;
    wins: number;
    podiums: number;
    driverWC: number;

    dob?: Date;
    dateJoined?: Date;
    lastUpdate?: Date;
    isDeleted?: boolean;
    deletedAt?: Date;
    updatedBy?: string;
    

}

export const createDriverSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long").max(64, "Password must be at most 64 characters long"),
    role: z.enum(['viewer', 'creator', 'admin']),
    status: z.enum(['active', 'suspended']).optional().default('active'),
    racingNumber: z.coerce.number().min(1, "Racing number must be a non-empty string"),
    nationality: z.string().min(1, "Nationality is required"),
    driverImage: z.url().optional(),
    driverTeam: z.string().min(1, "Team is required"),
    driverDES: z.string().optional(),
    wins: z.coerce.number().min(0, "Wins must be a number"),
    podiums: z.coerce.number().min(0, "Podiums must be a number"),
    driverWC: z.coerce.number().min(0, "WC count is required"),
    dob: z.coerce.date().optional(),
    dateJoined: z.coerce.date().optional(),
    lastUpdate: z.coerce.date().optional(),
});

export const adminCreateUserSchema = createDriverSchema;

export const updateDriverSchema = createDriverSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided'
});

export const updateRoleSchema = z.object({
    role: z.enum(['viewer', 'creator', 'admin'])
});

export const updateStatusSchema = z.object({
    status: z.enum(['active', 'suspended'])
});

export const resetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long").max(64, "Password must be at most 64 characters long")
});

export const adminUserQuerySchema = z.object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
    role: z.enum(['viewer', 'creator', 'admin']).optional(),
    status: z.enum(['active', 'suspended']).optional(),
    search: z.string().trim().optional(),
    includeDeleted: z.coerce.boolean().optional().default(false)
});

