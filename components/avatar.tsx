import { avatarColors } from '@/lib/constants'
import { initials } from '@/lib/time'
import { cn } from '@/lib/utils'

export function Avatar({ id, name, className }: { id: number; name: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
        avatarColors[id % avatarColors.length],
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  )
}
