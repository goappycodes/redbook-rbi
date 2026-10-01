import LoginForm from './LoginForm'

export const metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/admin'
  return (
    <main className="auth">
      <div className="auth__card">
        <div className="auth__head">
          <span className="auth__logo" role="img" aria-label="RedBook Intelligence" />
          <p className="auth__eyebrow">Content manager</p>
        </div>
        <div className="auth__body">
          <LoginForm next={safeNext} notEditor={error === 'not-an-editor'} />
        </div>
      </div>
    </main>
  )
}
