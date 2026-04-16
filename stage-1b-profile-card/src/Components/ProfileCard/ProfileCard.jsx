import { useEffect, useState } from 'react'
import './ProfileCard.css'

function ProfileCard() {
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  const hobbies = ['Design systems', 'Reading', 'Frontend experiments']
  const dislikes = ['Poor accessibility', 'Messy UI', 'Slow feedback loops']

  return (
    <article
      className="profile-card"
      data-testid="test-profile-card"
      aria-label="User profile card"
    >
      <figure className="profile-card__figure">
        <img
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80"
          alt="Portrait of Tolu smiling"
          className="profile-card__avatar"
          data-testid="test-user-avatar"
        />
        <figcaption className="profile-card__caption">
          Frontend Developer
        </figcaption>
      </figure>

      <div className="profile-card__content">
        <header className="profile-card__header">
          <h2 className="profile-card__name" data-testid="test-user-name">
            Tolu Omoniyi
          </h2>

          <p className="profile-card__bio" data-testid="test-user-bio">
            Frontend-focused builder who enjoys creating accessible,
            responsive, and polished user interfaces with clean structure
            and thoughtful user experience.
          </p>
        </header>

        <section className="profile-card__section" aria-label="Current time">
          <span className="profile-card__label">Current time (milliseconds)</span>
          <p
            className="profile-card__time"
            data-testid="test-user-time"
            aria-live="polite"
          >
            {currentTime}
          </p>
        </section>

        <nav
          className="profile-card__section"
          aria-label="Social links"
          data-testid="test-user-social-links"
        >
          <span className="profile-card__label">Social links</span>
          <ul className="profile-card__social-list">
            <li>
              <a
                href="https://github.com/Tolu-omni"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="test-user-social-github"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="test-user-social-linkedin"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="test-user-social-twitter"
              >
                Twitter
              </a>
            </li>
          </ul>
        </nav>

        <div className="profile-card__lists">
          <section
            className="profile-card__section"
            aria-label="Hobbies"
            data-testid="test-user-hobbies"
          >
            <span className="profile-card__label">Hobbies</span>
            <ul className="profile-card__pill-list">
              {hobbies.map((hobby) => (
                <li key={hobby} className="profile-card__pill">
                  {hobby}
                </li>
              ))}
            </ul>
          </section>

          <section
            className="profile-card__section"
            aria-label="Dislikes"
            data-testid="test-user-dislikes"
          >
            <span className="profile-card__label">Dislikes</span>
            <ul className="profile-card__pill-list">
              {dislikes.map((item) => (
                <li
                  key={item}
                  className="profile-card__pill profile-card__pill--muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  )
}

export default ProfileCard