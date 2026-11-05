import React from 'react'
import ReactDOM from 'react-dom/client'
import KingdomHierarchy from './KingdomHierarchy.jsx'
import CommunityPortal from './CommunityPortal.jsx'
import './index.css'

const isCommunityPage = new URLSearchParams(window.location.search).get('page') === 'community'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isCommunityPage ? <CommunityPortal /> : <KingdomHierarchy />}
  </React.StrictMode>,
)