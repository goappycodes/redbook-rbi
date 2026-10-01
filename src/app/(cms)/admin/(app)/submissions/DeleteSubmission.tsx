'use client'
import { useTransition } from 'react'
import { deleteSubmission } from '../../actions'
import { useDialog } from '../dialog'

export default function DeleteSubmission({ id }: { id: number }) {
  const [pending, start] = useTransition()
  const { confirm, alert } = useDialog()
  return (
    <button
      className="btn btn--sm btn--ghost btn--danger"
      disabled={pending}
      title="Delete this submission"
      onClick={async () => {
        if (!(await confirm({
          title: 'Delete submission?',
          message: 'This permanently deletes the submission. This cannot be undone.',
          confirmText: 'Delete',
          danger: true,
        }))) return
        start(async () => {
          const res = await deleteSubmission(id)
          if (!res.ok) await alert({ title: "Couldn't delete", message: res.message })
        })
      }}
    >
      Delete
    </button>
  )
}
