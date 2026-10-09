import { NextResponse } from 'next/server'
import { handleError, parseBody, parseId, requireUser } from '@/lib/api'
import { addComment } from '@/lib/mutations'
import { commentSchema } from '@/lib/validation'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const id = parseId((await params).id)
    const { body } = await parseBody(req, commentSchema)
    const comment = await addComment(user, id, body)
    return NextResponse.json({ comment }, { status: 201 })
  } catch (e) {
    return handleError(e)
  }
}
