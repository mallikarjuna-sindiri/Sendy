import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Setup from './pages/Setup'
import Editor from './pages/Editor'
import Viewer from './pages/Viewer'
import Expired from './pages/Expired'

import GoToUrl from './pages/GoToUrl'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/goto" element={<GoToUrl />} />
        <Route path="/setup/:domain" element={<Setup />} />
        <Route path="/editor/:domain" element={<Editor />} />
        <Route path="/expired" element={<Expired />} />
        <Route path="/:domain" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App