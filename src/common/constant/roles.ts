import { Role } from '@prisma/client'

export const RoleAdmin = 'ADMIN'
export const RoleUser = 'USER'
export type RoleAdmin = typeof RoleAdmin
export type SystemRole = Role | RoleAdmin
