'use client'
import { useTransition } from 'react'
import { deleteSubmission } from '../../actions'

export default function DeleteSubmission({ id }: { id: number }) {
  const [pending, start] = useTransition()
  return (
    <button
      className="btn btn--sm btn--ghost btn--danger"
      disabled={pending}
      title="Delete this submission"
      onClick={() => {
        if (!confirm('Delete this submission permanently?')) return
        start(async () => {
          const res = await deleteSubmission(id)
          if (!res.ok) alert(res.message)
        })
      }}
    >
      Delete
    </button>
  )
}
