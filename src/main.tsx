import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root')
const clerkPublishableKey = getClerkPublishableKey(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
)

if (!rootElement) {
  throw new Error('Root element not found.')
}

if (!clerkPublishableKey.ok) {
  createRoot(rootElement).render(
    <StrictMode>
      <ClerkConfigError reason={clerkPublishableKey.reason} />
    </StrictMode>,
  )
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ClerkProvider publishableKey={clerkPublishableKey.value}>
        <App />
      </ClerkProvider>
    </StrictMode>,
  )
}

type ClerkPublishableKeyResult =
  | { ok: true; value: string }
  | { ok: false; reason: 'missing' | 'malformed' }

function getClerkPublishableKey(
  value: string | undefined
): ClerkPublishableKeyResult {
  const publishableKey = value?.trim()

  if (!publishableKey) {
    return { ok: false, reason: 'missing' }
  }

  if (!isValidClerkPublishableKey(publishableKey)) {
    return { ok: false, reason: 'malformed' }
  }

  return { ok: true, value: publishableKey }
}

function isValidClerkPublishableKey(value: string): boolean {
  const keyMatch = /^pk_(test|live)_(.+)$/.exec(value)

  if (!keyMatch) {
    return false
  }

  try {
    const decodedKey = decodeBase64Url(keyMatch[2]).replace(/\$$/, '')
    const frontendApiUrl = new URL(`https://${decodedKey}`)

    return Boolean(frontendApiUrl.hostname) && frontendApiUrl.hostname === decodedKey
  } catch {
    return false
  }
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  return window.atob(paddedBase64)
}

function ClerkConfigError({ reason }: { reason: 'missing' | 'malformed' }) {
  return (
    <main className="startup-error" role="alert">
      <section className="startup-error-card">
        <p className="startup-error-label">FocusFlow setup issue</p>
        <h1>Clerk is not configured</h1>
        <p>
          {reason === 'missing'
            ? 'The VITE_CLERK_PUBLISHABLE_KEY environment variable is missing from this deployment.'
            : 'The VITE_CLERK_PUBLISHABLE_KEY environment variable is not a valid Clerk publishable key.'}
        </p>
        <p>
          In Vercel Project Settings, set
          {' '}
          <code>VITE_CLERK_PUBLISHABLE_KEY</code>
          {' '}
          to the publishable key from Clerk. It should start with
          {' '}
          <code>pk_test_</code>
          {' '}
          or
          {' '}
          <code>pk_live_</code>
          .
        </p>
      </section>
    </main>
  )
}
