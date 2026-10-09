import { z } from 'zod'
import { PRIORITIES, STATUSES, TEAMS } from '@/lib/constants'

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
