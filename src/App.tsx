import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import HashtagSearch from './pages/HashtagSearch'
import Sidebar from './components/Sidebar'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze/:username" element={<Analyze />} />
            <Route path="/hashtag" element={<HashtagSearch />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
