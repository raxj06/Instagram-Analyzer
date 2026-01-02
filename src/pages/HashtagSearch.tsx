import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Hash,
    Search,
    ArrowLeft,
    Heart,
    MessageCircle,
    ExternalLink,
    Loader2,
    AlertCircle,
    TrendingUp,
    Clock,
    Image as ImageIcon,
    Film,
    LayoutGrid
} from 'lucide-react'
import { searchHashtag, isApiConfigured } from '../lib/instagram'
import type { HashtagSearchResult, HashtagMedia } from '../lib/instagram'
import { formatNumber } from '../data/sampleData'
import MetricCard from '../components/MetricCard'

export default function HashtagSearch() {
    const [hashtag, setHashtag] = useState('')
    const [searchType, setSearchType] = useState<'top' | 'recent'>('top')
    const [result, setResult] = useState<HashtagSearchResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!hashtag.trim()) return

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const data = await searchHashtag(hashtag, searchType)
            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search hashtag')
        } finally {
            setLoading(false)
        }
    }

    const getMediaIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return <Film size={14} />
            case 'CAROUSEL_ALBUM': return <LayoutGrid size={14} />
            default: return <ImageIcon size={14} />
        }
    }

    return (
        <div className="hashtag-search-page">
            {/* Header */}
            <div className="page-header">
                <Link to="/" className="back-button">
                    <ArrowLeft size={18} />
                    Back
                </Link>
                <h1><Hash size={24} /> Hashtag Search</h1>
            </div>

            {/* API Warning */}
            {!isApiConfigured() && (
                <div className="warning-banner">
                    <AlertCircle size={16} />
                    API not configured. Please add credentials to .env file.
                </div>
            )}

            {/* Rate Limit Warning */}
            <div className="rate-limit-banner">
                <AlertCircle size={16} />
                <span>
                    <strong>API Limit:</strong> You can search 30 unique hashtags per 7 days. Use wisely!
                </span>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                    <Hash size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Enter hashtag (e.g., fitness)"
                        value={hashtag}
                        onChange={(e) => setHashtag(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button" disabled={loading}>
                        {loading ? <Loader2 size={18} className="spinner" /> : <Search size={18} />}
                        Search
                    </button>
                </div>

                {/* Type Toggle */}
                <div className="type-toggle">
                    <button
                        type="button"
                        className={`toggle-btn ${searchType === 'top' ? 'active' : ''}`}
                        onClick={() => setSearchType('top')}
                    >
                        <TrendingUp size={16} />
                        Top Posts
                    </button>
                    <button
                        type="button"
                        className={`toggle-btn ${searchType === 'recent' ? 'active' : ''}`}
                        onClick={() => setSearchType('recent')}
                    >
                        <Clock size={16} />
                        Recent (24h)
                    </button>
                </div>
            </form>

            {/* Error */}
            {error && (
                <div className="error-banner">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="loading-state">
                    <Loader2 size={48} className="spinner" />
                    <p>Searching #{hashtag}...</p>
                </div>
            )}

            {/* Results */}
            {result && !loading && (
                <div className="results-section">
                    {/* Stats */}
                    <div className="stats-header">
                        <h2>#{result.hashtagName}</h2>
                        <span className="post-count">{result.mediaCount} posts found</span>
                    </div>

                    <div className="metrics-grid">
                        <MetricCard
                            icon={<Heart size={20} />}
                            iconColor="pink"
                            label="Avg. Likes"
                            value={result.avgLikes}
                        />
                        <MetricCard
                            icon={<MessageCircle size={20} />}
                            iconColor="purple"
                            label="Avg. Comments"
                            value={result.avgComments}
                        />
                        <MetricCard
                            icon={<TrendingUp size={20} />}
                            iconColor="green"
                            label="Avg. Engagement"
                            value={result.avgLikes + result.avgComments}
                        />
                    </div>

                    {/* Media Grid */}
                    <div className="media-grid">
                        {result.media.map((post: HashtagMedia) => (
                            <a
                                key={post.id}
                                href={post.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="media-card"
                            >
                                <div className="media-thumbnail">
                                    {post.media_url ? (
                                        <img src={post.media_url} alt="Post" />
                                    ) : (
                                        <div className="placeholder-img">
                                            {getMediaIcon(post.media_type)}
                                        </div>
                                    )}
                                    <div className="media-type-badge">
                                        {getMediaIcon(post.media_type)}
                                    </div>
                                    <div className="media-overlay">
                                        <ExternalLink size={20} />
                                    </div>
                                </div>
                                <div className="media-stats">
                                    <span><Heart size={14} /> {formatNumber(post.like_count || 0)}</span>
                                    <span><MessageCircle size={14} /> {formatNumber(post.comments_count || 0)}</span>
                                </div>
                                {post.caption && (
                                    <p className="media-caption">
                                        {post.caption.substring(0, 80)}{post.caption.length > 80 ? '...' : ''}
                                    </p>
                                )}
                            </a>
                        ))}
                    </div>

                    {result.media.length === 0 && (
                        <div className="no-results">
                            <AlertCircle size={48} />
                            <p>No posts found for #{result.hashtagName}</p>
                            {searchType === 'recent' && (
                                <span>Recent posts only shows content from the last 24 hours</span>
                            )}
                        </div>
                    )}
                </div>
            )}

            <style>{`
        .hashtag-search-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-lg);
        }
        .page-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }
        .page-header h1 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-size-xl);
          color: var(--text-primary);
        }
        .back-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--text-secondary);
          text-decoration: none;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .back-button:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .warning-banner, .rate-limit-banner, .error-banner {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-md);
          font-size: var(--font-size-sm);
        }
        .warning-banner {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .rate-limit-banner {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .search-form {
          margin-bottom: var(--spacing-xl);
        }
        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          border: 2px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: var(--spacing-sm);
          box-shadow: var(--card-shadow);
          margin-bottom: var(--spacing-md);
        }
        .search-input-wrapper:focus-within {
          border-color: var(--accent-instagram);
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
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          transition: all var(--transition-base);
        }
        .search-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(225, 48, 108, 0.4);
        }
        .search-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .type-toggle {
          display: flex;
          gap: var(--spacing-sm);
          justify-content: center;
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-lg);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          background: var(--bg-primary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .toggle-btn.active {
          background: linear-gradient(135deg, rgba(131, 58, 180, 0.1), rgba(225, 48, 108, 0.1));
          border-color: var(--accent-instagram);
          color: var(--accent-instagram);
        }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--spacing-2xl);
          color: var(--text-secondary);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .stats-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
        }
        .stats-header h2 {
          font-size: var(--font-size-xl);
          background: linear-gradient(135deg, #833AB4, #E1306C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .post-count {
          color: var(--text-tertiary);
          font-size: var(--font-size-sm);
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-md);
        }
        .media-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          overflow: hidden;
          text-decoration: none;
          transition: all var(--transition-base);
        }
        .media-card:hover {
          box-shadow: var(--card-shadow-hover);
          transform: translateY(-2px);
        }
        .media-thumbnail {
          position: relative;
          aspect-ratio: 1;
          background: var(--bg-secondary);
        }
        .media-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .placeholder-img {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
        }
        .media-type-badge {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
        }
        .media-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .media-card:hover .media-overlay {
          opacity: 1;
        }
        .media-stats {
          display: flex;
          gap: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          border-bottom: 1px solid var(--border-light);
        }
        .media-stats span {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
        .media-caption {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .no-results {
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--text-tertiary);
        }
        .no-results span {
          font-size: var(--font-size-sm);
          display: block;
          margin-top: var(--spacing-sm);
        }
        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .media-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
        </div>
    )
}
