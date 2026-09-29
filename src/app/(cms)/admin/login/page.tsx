import LoginForm from './LoginForm'

export const metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/admin'
  return (
    <main className="auth">
      <div className="auth__card">
        <h1>RedBook Intelligence</h1>
        <p>Sign in to edit the page.</p>
        <LoginForm next={safeNext} notEditor={error === 'not-an-editor'} />
      </div>
    </main>
  )
}
