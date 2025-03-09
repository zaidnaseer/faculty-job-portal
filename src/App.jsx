import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import VacanciesPage from './pages/VacanciesPage'
import ResumePage from './pages/ResumePage'
import HRPage from './pages/HRPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<VacanciesPage />} />
          <Route path="/vacancies" element={<VacanciesPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/hr" element={<HRPage />} />
        </Routes>
      </main>
      <footer className="bg-dark text-white py-4 text-center">
        <p>© {new Date().getFullYear()} Upadhyaya. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
