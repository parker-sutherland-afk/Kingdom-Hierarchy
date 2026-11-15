import React from 'react'
import ReactDOM from 'react-dom/client'
import SignInPortal, { clearGoogleSession, isGoogleSignInEnabled, readGoogleBrowserSession } from './SignIn.jsx'
import KingdomHierarchy from './KingdomHierarchy.jsx'
import CommunityPortal from './CommunityPortal.jsx'
import LegalFooter from './LegalLinks.jsx'
import VoteCalculator from './VoteCalculator.jsx'
import RosterDownloadButton from './RosterDownload.jsx'
import { GuestBar, GuestLocked } from './GuestPreview.jsx'
import { getHankoIdentity, initializeHanko, isHankoEnabled } from './hankoAuth.js'
import './index.css'

function App() {
  const [identity, setIdentity] = React.useState(() => readGoogleBrowserSession())
  const [showSignIn, setShowSignIn] = React.useState(false)
  // Where to send a guest after they sign in (e.g. the profile or page they tried to open).
  const returnToRef = React.useRef(null)
  const applyReturnTo = React.useCallback(() => {
    if (!returnToRef.current) return
    window.history.replaceState(window.history.state, '', returnToRef.current)
    returnToRef.current = null
  }, [])
  const onSignIn = React.useCallback(nextIdentity => {
    applyReturnTo()
    setIdentity(nextIdentity)
  }, [applyReturnTo])
  const openSignIn = React.useCallback(returnTo => {
    returnToRef.current = typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : null
    window.scrollTo({ top: 0 })
    setShowSignIn(true)
  }, [])
  const closeSignIn = React.useCallback(() => {
    returnToRef.current = null
    setShowSignIn(false)
  }, [])
  const [hankoClient, setHankoClient] = React.useState(null)
  const [authLoading, setAuthLoading] = React.useState(isHankoEnabled)
  const [authError, setAuthError] = React.useState('')

  React.useEffect(() => {
    if (identity) setShowSignIn(false)
  }, [identity])

  React.useEffect(() => {
    if (!isHankoEnabled) return undefined

    let active = true
    const removeListeners = []

    async function syncHankoSession(client) {
      try {
        const nextIdentity = await getHankoIdentity(client)
        if (active) {
          if (nextIdentity) applyReturnTo()
          setIdentity(nextIdentity)
          setAuthError('')
        }
      } catch (error) {
        if (active) {
          setIdentity(null)
          setAuthError(error instanceof Error ? error.message : 'Could not verify the Hanko session.')
        }
      } finally {
        if (active) setAuthLoading(false)
      }
    }

    initializeHanko()
      .then(async client => {
        if (!active) return
        setHankoClient(client)
        removeListeners.push(client.onSessionCreated(() => syncHankoSession(client)))
        removeListeners.push(client.onSessionExpired(() => {
          if (active) setIdentity(null)
        }))
        removeListeners.push(client.onUserLoggedOut(() => {
          if (active) setIdentity(null)
        }))

        if (!readGoogleBrowserSession()) await syncHankoSession(client)
        else setAuthLoading(false)
      })
      .catch(error => {
        if (active) {
          setAuthError(error instanceof Error ? error.message : 'Could not connect to Hanko.')
          setAuthLoading(false)
        }
      })

    return () => {
      active = false
      removeListeners.forEach(removeListener => removeListener())
    }
  }, [applyReturnTo])

  React.useEffect(() => {
    if (!identity || identity.provider === 'hanko') return undefined

    const expiresIn = Math.max(0, identity.expiresAt - Date.now())
    const expiryTimer = window.setTimeout(() => {
      clearGoogleSession()
      setIdentity(null)
    }, Math.min(expiresIn, 2_147_483_647))

    return () => window.clearTimeout(expiryTimer)
  }, [identity])

  async function signOut() {
    if (identity?.provider === 'hanko') {
      if (!hankoClient) {
        setAuthError('Hanko is not ready to sign out. Please try again.');
        return;
      }
      try {
        await hankoClient.logout()
        setIdentity(null)
        setAuthError('')
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Hanko could not sign you out.');
      }
      return
    }

    clearGoogleSession()
    setIdentity(null)
  }

  const signInEnabled = isGoogleSignInEnabled || isHankoEnabled
  if (authLoading && !identity) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d0b] px-4 font-sans text-sm text-stone-300">
        <p role="status">Checking your sign-in…</p>
      </main>
    )
  }
  if (signInEnabled && !identity && showSignIn) {
    return <SignInPortal onSuccess={onSignIn} onBack={closeSignIn} initialError={authError} />
  }

  const isGuest = signInEnabled && !identity
  const isCommunityPage = new URLSearchParams(window.location.search).get('page') === 'community'
  const Page = isCommunityPage ? CommunityPortal : KingdomHierarchy

  return (
    <>
      {identity ? (
        <div className="sticky top-0 z-[70] border-b border-stone-800 bg-[#11120f]/95 px-3 py-2 backdrop-blur sm:px-5">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 font-sans text-[10px] sm:text-xs">
            <p className="min-w-0 truncate text-stone-400">
              Signed in as <span className="font-semibold text-stone-200">{identity.name}</span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <RosterDownloadButton />
              <button
                type="button"
                onClick={signOut}
                className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-stone-700 px-3 font-semibold text-stone-300 transition hover:border-amber-400/50 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
              >
                Sign out
              </button>
            </div>
          </div>
          <p className="mx-auto mt-1 max-w-6xl font-sans text-[9px] text-stone-600">Sign-in is for browser identity only; this GitHub Pages site and its files are public.</p>
        </div>
      ) : isGuest ? (
        <GuestBar onSignIn={openSignIn} />
      ) : (
        <div role="status" className="border-b border-amber-900/40 bg-amber-950/30 px-3 py-2 text-center font-sans text-[10px] text-amber-200 sm:text-xs">
          No sign-in provider is configured; this site is public.
        </div>
      )}
      {authError && identity && <p role="alert" className="bg-red-950/70 px-4 py-2 text-center font-sans text-xs text-red-100">{authError}</p>}
      {isGuest && isCommunityPage
        ? <GuestLocked feature="Community pages" onSignIn={openSignIn} />
        : <Page guest={isGuest} onRequestSignIn={openSignIn} />}
      {!isCommunityPage && <VoteCalculator />}
      <LegalFooter />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
