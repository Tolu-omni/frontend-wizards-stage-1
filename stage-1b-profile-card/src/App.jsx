import ProfileCard from './components/ProfileCard'
import './App.css'

function App() {
  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">Profile Card</h1>
        <p className="page-subtitle">
          Accessible and responsive profile card for Stage 1B
        </p>
      </header>

      <section className="page-card-wrap" aria-label="Profile card preview">
        <ProfileCard />
      </section>
    </main>
  )
}

export default App