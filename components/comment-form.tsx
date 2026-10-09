'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api } from '@/lib/client'

export function CommentForm({ ticketId }: { ticketId: number }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!body.trim() || sending) return
    setSending(true)
    setError('')
    try {
      await api(`/api/tickets/${ticketId}/comments`, 'POST', { body })
      setBody('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post comment.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <label htmlFor="comment" className="sr-only">Add a comment</label>
      <textarea id="comment" value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && submit()} placeholder="Write a reply…" className="min-h-24 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none ring-indigo-500 focus:ring-2" />
      {error && <p className="mt-2 text-xs font-medium text-rose-700" role="alert">{error}</p>}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-400">Ctrl/⌘ + Enter to send</p>
        <button type="submit" disabled={sending || !body.trim()} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {sending ? 'Sending…' : 'Reply'}
        </button>
      </div>
    </form>
  )
}
