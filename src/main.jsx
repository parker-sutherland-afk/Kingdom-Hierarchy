import React from 'react'
import ReactDOM from 'react-dom/client'
import SignInPortal, { isGoogleSignInEnabled, readGoogleBrowserSession } from './SignIn.jsx'
import KingdomHierarchy from './KingdomHierarchy.jsx'
import CommunityPortal from './CommunityPortal.jsx'
import './index.css'

const GOOGLE_SESSION_KEY = 'imperius.google.identity'

function App() {
  const [identity, setIdentity] = React.useState(() => readGoogleBrowserSession())
  const onSignIn = React.useCallback(nextIdentity => setIdentity(nextIdentity), [])

  React.useEffect(() => {
    if (!identity) return undefined

    const expiresIn = Math.max(0, identity.expiresAt - Date.now())
    const expiryTimer = window.setTimeout(() => {
      sessionStorage.removeItem(GOOGLE_SESSION_KEY)
      setIdentity(null)
    }, Math.min(expiresIn, 2_147_483_647))

    return () => window.clearTimeout(expiryTimer)
  }, [identity])

  function signOut() {
    sessionStorage.removeItem(GOOGLE_SESSION_KEY)
    setIdentity(null)
  }

  if (isGoogleSignInEnabled && !identity) return <SignInPortal onSuccess={onSignIn} />

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
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-stone-700 px-3 font-semibold text-stone-300 transition hover:border-amber-400/50 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
            >
              Sign out
            </button>
          </div>
          <p className="mx-auto mt-1 max-w-6xl font-sans text-[9px] text-stone-600">Google sign-in is for browser identity only; this GitHub Pages site and its files are public.</p>
        </div>
      ) : (
        <div role="status" className="border-b border-amber-900/40 bg-amber-950/30 px-3 py-2 text-center font-sans text-[10px] text-amber-200 sm:text-xs">
          Google sign-in is not configured; this site is currently public.
        </div>
      )}
      <Page />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
