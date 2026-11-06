import React from 'react'
import ReactDOM from 'react-dom/client'
import SignInPortal from './SignIn.jsx'
import KingdomHierarchy from './KingdomHierarchy.jsx'
import CommunityPortal from './CommunityPortal.jsx'
import './index.css'

const isCommunityPage = new URLSearchParams(window.location.search).get('page') === 'community'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isCommunityPage ? <CommunityPortal /> : <KingdomHierarchy />}
  </React.StrictMode>,
)

const isSignInPortal = new URLSearchParams(window.location.search).get('page') === 'signin'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isSignInPortral ? <SignInPortal /> : <KingdomHierarchy />}
  </React.StrictMode>,
)
