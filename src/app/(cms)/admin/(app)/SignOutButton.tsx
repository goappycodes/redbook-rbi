'use client'
import { signOut } from '../actions'
import { useDialog } from './dialog'

/* Sign-out, behind a styled confirm so a stray click doesn't end the session. */
export default function SignOutButton() {
  const { confirm } = useDialog()
  return (
    <button
      type="button"
      className="side__signout"
      aria-label="Sign out"
      title="Sign out"
      onClick={async () => {
        if (await confirm({ title: 'Sign out', message: 'Signing out will end your session. Are you sure you want to sign out?', confirmText: 'Sign out' })) {
          await signOut()
        }
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    </button>
  )
}
