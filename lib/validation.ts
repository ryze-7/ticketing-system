import { z } from 'zod'
import { PRIORITIES, ROLES, STATUSES, TEAMS } from '@/lib/constants'

export const createTicketSchema = z.object({
  title: z.string().trim().min(3, 'Please describe the problem in a few words.').max(160),
  description: z.string().trim().max(5000).default(''),
  priority: z.enum(PRIORITIES).default('Medium'),
  team: z.enum(TEAMS).default('Operations'),
})

export const updateTicketSchema = z
  .object({
    status: z.enum(STATUSES),
    priority: z.enum(PRIORITIES),
    team: z.enum(TEAMS),
    assigneeId: z.number().int().positive().nullable(),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update.')

export const commentSchema = z.object({
  body: z.string().trim().min(1, 'Comment cannot be empty.').max(5000),
})

const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(254)
const password = z.string().min(8, 'Password must be at least 8 characters.').max(200)
const name = z.string().trim().min(2, 'Please enter your name.').max(80)

export const signupSchema = z.object({ name, email, password, team: z.enum(TEAMS).default('Operations') })
export const loginSchema = z.object({ email, password: z.string().min(1, 'Enter your password.').max(200) })
export const adminCreateUserSchema = z.object({
  name,
  email,
  password,
  team: z.enum(TEAMS).default('Operations'),
  role: z.enum(ROLES).default('employee'),
})
export const adminUpdateUserSchema = z
  .object({ role: z.enum(ROLES), team: z.enum(TEAMS), password })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update.')
