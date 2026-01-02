import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Users, BarChart3, Clock, ArrowRight } from 'lucide-react'
import { recentSearches } from '../data/sampleData'

export default function Home() {
    const [username, setUsername] = useState('')
    const navigate = useNavigate()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (username.trim()) {
            navigate(`/analyze/${username.trim().replace('@', '')}`)
        }
    }

    const handleRecentSearch = (un: string) => {
        navigate(`/analyze/${un}`)
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <div className="hero-section">
                <h1 className="hero-title">
                    Analyze Any Instagram Account
                </h1>
                <p className="hero-subtitle">
                    Discover content strategies, engagement patterns, and posting insights from any public Instagram profile
                </p>

                {/* Search Box */}
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Enter Instagram username (e.g., nike)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            Analyze
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </form>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                    <div className="recent-searches">
                        <span className="recent-label">
                            <Clock size={14} />
                            Recent:
                        </span>
                        {recentSearches.map((search) => (
                            <button
                                key={search.username}
                                onClick={() => handleRecentSearch(search.username)}
                                className="recent-chip"
                            >
                                @{search.username}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Features Section */}
            <div className="features-section">
                <h2 className="section-title">What You'll Discover</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon pink">
                            <BarChart3 size={24} />
                        </div>
                        <h3>Engagement Analysis</h3>
                        <p>Calculate engagement rates and compare performance against industry benchmarks</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon blue">
                            <TrendingUp size={24} />
                        </div>
                        <h3>Content Strategy</h3>
                        <p>Understand what type of content performs best - Reels, Carousels, or Images</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon green">
                            <Clock size={24} />
                        </div>
                        <h3>Posting Patterns</h3>
                        <p>Discover the best days and times to post based on historical data</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon purple">
                            <Users size={24} />
                        </div>
                        <h3>Collaboration Insights</h3>
                        <p>Identify brand partnerships and frequently mentioned accounts</p>
                    </div>
                </div>
            </div>

            <style>{`
        .home-page {
          max-width: 900px;
          margin: 0 auto;
          padding: var(--spacing-xl) 0;
        }

        .hero-section {
          text-align: center;
          padding: var(--spacing-2xl) 0;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
          background: linear-gradient(135deg, #833AB4, #E1306C, #F77737);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: var(--font-size-lg);
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto var(--spacing-xl);
          line-height: 1.6;
        }

        .search-form {
          max-width: 600px;
          margin: 0 auto var(--spacing-lg);
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          border: 2px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: var(--spacing-sm);
          transition: all var(--transition-base);
          box-shadow: var(--card-shadow);
        }

        .search-input-wrapper:focus-within {
          border-color: var(--accent-instagram);
          box-shadow: 0 0 0 4px var(--accent-instagram-light);
        }

        .search-icon {
          color: var(--text-tertiary);
          margin-left: var(--spacing-md);
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: var(--spacing-md);
          font-size: var(--font-size-base);
          background: transparent;
          color: var(--text-primary);
        }

        .search-input::placeholder {
          color: var(--text-tertiary);
        }

        .search-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: linear-gradient(135deg, #833AB4, #E1306C);
          color: white;
          border: none;
          padding: var(--spacing-md) var(--spacing-xl);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .search-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(225, 48, 108, 0.4);
        }

        .recent-searches {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .recent-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
        }

        .recent-chip {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: 9999px;
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .recent-chip:hover {
          background: var(--accent-instagram-light);
          border-color: var(--accent-instagram);
          color: var(--accent-instagram);
        }

        .features-section {
          padding-top: var(--spacing-2xl);
        }

        .section-title {
          text-align: center;
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          margin-bottom: var(--spacing-xl);
          color: var(--text-primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg);
        }

        .feature-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          transition: all var(--transition-base);
        }

        .feature-card:hover {
          box-shadow: var(--card-shadow-hover);
          transform: translateY(-2px);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--spacing-md);
        }

        .feature-icon.pink {
          background: var(--accent-instagram-light);
          color: var(--accent-instagram);
        }

        .feature-icon.blue {
          background: var(--accent-blue-light);
          color: var(--accent-blue);
        }

        .feature-icon.green {
          background: var(--accent-green-light);
          color: var(--accent-green);
        }

        .feature-icon.purple {
          background: var(--accent-purple-light);
          color: var(--accent-purple);
        }

        .feature-card h3 {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          margin-bottom: var(--spacing-sm);
          color: var(--text-primary);
        }

        .feature-card p {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 1.75rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .search-input-wrapper {
            flex-direction: column;
            padding: var(--spacing-sm);
          }

          .search-input {
            width: 100%;
            text-align: center;
          }

          .search-button {
            width: 100%;
            justify-content: center;
            margin-top: var(--spacing-sm);
          }

          .search-icon {
            display: none;
          }
        }
      `}</style>
        </div>
    )
}
