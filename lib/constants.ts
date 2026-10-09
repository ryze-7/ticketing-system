export const STATUSES = ['Open', 'In progress', 'Waiting', 'Resolved'] as const
export const PRIORITIES = ['Low', 'Medium', 'High'] as const
export const TEAMS = ['Operations', 'Fleet', 'Dispatch', 'Finance', 'Customer Care', 'IT'] as const
export const ROLES = ['employee', 'agent', 'admin'] as const

export type Status = (typeof STATUSES)[number]
export type Priority = (typeof PRIORITIES)[number]
export type Team = (typeof TEAMS)[number]
export type Role = (typeof ROLES)[number]

export const statusStyles: Record<Status, string> = {
  Open: 'bg-sky-50 text-sky-700',
  'In progress': 'bg-violet-50 text-violet-700',
  Waiting: 'bg-amber-50 text-amber-700',
  Resolved: 'bg-emerald-50 text-emerald-700',
}

export const priorityStyles: Record<Priority, string> = {
  High: 'text-rose-600',
  Medium: 'text-amber-600',
  Low: 'text-emerald-600',
}

export const avatarColors = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
]

export const isAgentRole = (role: Role) => role === 'agent' || role === 'admin'
