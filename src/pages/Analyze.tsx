import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Film,
  LayoutGrid,
  Play,
  ExternalLink,
  CheckCircle,
  Hash,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
  Sparkles,
  Brain,
  Lightbulb,
  Database
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts'
import { analyzeInstagramProfile, isApiConfigured } from '../lib/instagram'
import { analyzeWithGemini, isGeminiConfigured } from '../lib/gemini'
import type { AIAnalysisResult } from '../lib/gemini'
import type { AnalysisResult } from '../data/sampleData'
import { sampleAnalysis, formatNumber, getEngagementRating } from '../data/sampleData'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'

const CONTENT_COLORS = {
  reels: '#E1306C',
  carousels: '#833AB4',
  images: '#F77737',
  videos: '#3B82F6',
}

export default function Analyze() {
  const { username } = useParams<{ username: string }>()
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!username) return;

      setLoading(true)
      setError(null)

      // Check if API is configured
      if (!isApiConfigured()) {
        console.log('API not configured, using sample data')
        setData(sampleAnalysis)
        setUsingMockData(true)
        setLoading(false)
        return
      }

      try {
        const result = await analyzeInstagramProfile(username)
        setData(result)
        setUsingMockData(false)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch profile')
        // Fall back to sample data on error
        setData(sampleAnalysis)
        setUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username])

  // Trigger AI analysis when data is loaded
  // Trigger AI analysis with Cache
  useEffect(() => {
    async function runAIAnalysis() {
      if (!data || !username || !isGeminiConfigured()) return;

      const cacheKey = `ai_analysis_${username.replace(/\./g, '_')}`; // Safe key

      // 1. Check Cache
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp, result } = JSON.parse(cached);
          // Valid for 1 hour
          if (Date.now() - timestamp < 3600000) {
            console.log('Using cached AI analysis for', username);
            setAiAnalysis(result);
            setAiLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Cache read error', e);
      }

      // 2. Fetch Fresh Data
      setAiLoading(true);
      try {
        const captions = data.posts.map(p => p.caption).filter(c => c && c.length > 0).slice(0, 15);
        if (captions.length === 0) return;

        const result = await analyzeWithGemini(captions);

        if (result) {
          setAiAnalysis(result);
          // Save to Cache
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            result
          }));
        }
      } catch (err) {
        console.error('AI analysis error:', err);
      } finally {
        setAiLoading(false);
      }
    }

    runAIAnalysis();
  }, [data, username]);

  const addToRecord = async () => {
    if (!data) return;

    // Format date as DD-MM-YYYY
    const now = new Date();
    const today = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

    // Helper to format number (simple version)
    const formatCount = (n: number) => {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
      return n.toString();
    };

    const payload = {
      insta_handle: data.profile.username,
      followers: formatCount(data.profile.followersCount), // Send as formatted string "274M"
      date: today,
      id_name: data.profile.name
    };

    const webhookUrl = import.meta.env.VITE_N8N_ADD_TO_RECORD_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl.includes('PLEASE_REPLACE')) {
      alert('Webhook URL not configured! Please set VITE_N8N_ADD_TO_RECORD_WEBHOOK_URL in .env');
      return;
    }

    try {
      console.log('Sending payload:', payload);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Webhook Response Status:', response.status);
      const responseText = await response.text();
      console.log('Webhook Response Body:', responseText);

      // Check for common n8n immediate response which technically means "received" but not "completed"
      if (responseText.includes('Workflow execution started')) {
        alert('Request sent to n8n (Async). Check n8n execution log for success/failure.');
      } else if (response.ok) {
        alert('Successfully added to record!');
      } else {
        alert(`Failed: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
      alert('Error connecting to webhook.');
    }
  };



  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={48} className="spinner" />
        <p>Analyzing @{username}...</p>
        <style>{`
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: var(--spacing-md);
            color: var(--text-secondary);
          }
          .spinner {
            animation: spin 1s linear infinite;
            color: var(--accent-instagram);
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="error-state">
        <AlertCircle size={48} />
        <h2>Profile Not Found</h2>
        <p>Could not find @{username}. Make sure it's a public Business/Creator account.</p>
        <Link to="/" className="back-link">← Try another search</Link>
      </div>
    )
  }

  const engagementRating = getEngagementRating(data.metrics.engagementRate)

  const contentMixData = [
    { name: 'Reels', value: data.metrics.contentMix.reels, color: CONTENT_COLORS.reels },
    { name: 'Carousels', value: data.metrics.contentMix.carousels, color: CONTENT_COLORS.carousels },
    { name: 'Images', value: data.metrics.contentMix.images, color: CONTENT_COLORS.images },
    { name: 'Videos', value: data.metrics.contentMix.videos, color: CONTENT_COLORS.videos },
  ].filter(item => item.value > 0) // Only show non-zero values

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'REEL': return <Play size={12} />
      case 'CAROUSEL': return <LayoutGrid size={12} />
      case 'VIDEO': return <Film size={12} />
      default: return <ImageIcon size={12} />
    }
  }

  return (
    <div className="analyze-page">
      {/* Header */}
      <div className="analyze-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={18} />
          Back to Search
        </Link>
        {usingMockData && (
          <div className="mock-data-badge">
            <AlertCircle size={14} />
            {error ? 'Error - Showing sample data' : 'Demo Mode - Configure API for real data'}
          </div>
        )}
        <button
          onClick={addToRecord}
          className="add-record-btn"
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            background: 'var(--accent-instagram)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(225, 48, 108, 0.2)'
          }}
        >
          <Database size={16} />
          Add to Record
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-card">
          <div className="profile-avatar">
            <img src={data.profile.profilePicture} alt={data.profile.name} />
            {data.profile.isVerified && (
              <div className="verified-badge">
                <CheckCircle size={16} />
              </div>
            )}
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <h1>@{data.profile.username}</h1>
              <span className="category-badge">{data.profile.category}</span>
            </div>
            <p className="profile-bio">{data.profile.bio}</p>
            {data.profile.website && (
              <a href={`https://${data.profile.website}`} target="_blank" rel="noopener noreferrer" className="profile-website">
                <ExternalLink size={14} />
                {data.profile.website}
              </a>
            )}
          </div>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-value">{formatNumber(data.profile.followersCount)}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="profile-stat">
              <span className="stat-value">{formatNumber(data.profile.followingCount)}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="profile-stat">
              <span className="stat-value">{formatNumber(data.profile.mediaCount)}</span>
              <span className="stat-label">Posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          icon={<TrendingUp size={20} />}
          iconColor="pink"
          label="Engagement Rate"
          value={`${data.metrics.engagementRate}%`}
        />
        <MetricCard
          icon={<Heart size={20} />}
          iconColor="pink"
          label="Avg. Likes"
          value={data.metrics.avgLikesPerPost}
        />
        <MetricCard
          icon={<MessageCircle size={20} />}
          iconColor="purple"
          label="Avg. Comments"
          value={data.metrics.avgCommentsPerPost}
        />
        <MetricCard
          icon={<Clock size={20} />}
          iconColor="blue"
          label="Posts per Week"
          value={data.metrics.postsPerWeek.toFixed(1)}
        />
      </div>

      {/* Engagement Score */}
      <div className="engagement-score-card">
        <div className="score-content">
          <div>
            <h3>Engagement Score</h3>
            <p>Based on likes and comments relative to follower count</p>
          </div>
          <div className="score-badge" style={{ background: engagementRating.color }}>
            {engagementRating.label}
          </div>
        </div>
        <div className="score-bar">
          <div
            className="score-fill"
            style={{
              width: `${Math.min(data.metrics.engagementRate * 10, 100)}%`,
              background: engagementRating.color
            }}
          />
        </div>
        <div className="score-labels">
          <span>0%</span>
          <span>Low (1%)</span>
          <span>Avg (3%)</span>
          <span>Good (6%)</span>
          <span>10%+</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Content Mix */}
        <ChartCard title="Content Mix" subtitle="Breakdown by post type">
          <div className="chart-container" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {contentMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-row">
            {contentMixData.map((item) => (
              <div key={item.name} className="legend-item">
                <span className="legend-dot" style={{ background: item.color }} />
                {item.name}: {item.value}%
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Posting Days */}
        <ChartCard title="Posting Schedule" subtitle="Most active days">
          <div className="chart-container" style={{ height: 280, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data.metrics.postingDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                <Bar dataKey="count" fill="#E1306C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Trending Hashtags - sorted by engagement */}
      {data.metrics.topHashtags.length > 0 && (
        <ChartCard title="Trending Hashtags" subtitle="Sorted by average engagement per post">
          <div className="hashtags-grid">
            {data.metrics.topHashtags.map((tag: { tag: string; count: number; avgEngagement: number }, index: number) => (
              <div key={tag.tag} className="hashtag-item">
                <span className="hashtag-rank">#{index + 1}</span>
                <span className="hashtag-name">
                  <Hash size={14} />
                  {tag.tag}
                </span>
                <div className="hashtag-stats">
                  <span className="hashtag-count">{tag.count} posts</span>
                  <span className="hashtag-engagement">{formatNumber(tag.avgEngagement)} avg</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Mention Network */}
      {data.metrics.topMentions && data.metrics.topMentions.length > 0 && (
        <ChartCard title="Collaboration Network" subtitle="Most mentioned accounts">
          <div className="mentions-grid">
            {data.metrics.topMentions.map((mention: { username: string; count: number; avgEngagement: number }, index: number) => (
              <div key={mention.username} className="mention-item">
                <span className="mention-rank">#{index + 1}</span>
                <div className="mention-info">
                  <span className="mention-username">@{mention.username}</span>
                  <span className="mention-count">{mention.count} collabs</span>
                </div>
                <div className="mention-engagement">
                  <span className="engagement-label">Avg Engagement</span>
                  <span className="engagement-value">{formatNumber(mention.avgEngagement)}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* AI Insights Section */}
      {(aiLoading || aiAnalysis) && (
        <div className="ai-section">
          <div className="ai-section-header">
            <Sparkles size={24} className="ai-icon" />
            <h2>AI Content Intelligence</h2>
            {aiLoading && <Loader2 size={20} className="spinner" />}
          </div>

          {aiLoading && (
            <div className="ai-loading">
              <p>Analyzing captions with Gemini AI...</p>
            </div>
          )}

          {aiAnalysis && (
            <div className="ai-insights-grid">
              {/* Sentiment Analysis */}
              {aiAnalysis.sentiment && (
                <ChartCard title="Caption Sentiment" subtitle="Overall tone of captions">
                  <div className="sentiment-card">
                    <div className={`sentiment-badge sentiment-${aiAnalysis.sentiment.overall || 'neutral'}`}>
                      {(aiAnalysis.sentiment.overall || 'neutral').toUpperCase()}
                    </div>
                    <div className="sentiment-score">
                      <span className="score-number">{aiAnalysis.sentiment.score || 0}</span>
                      <span className="score-label">/ 100</span>
                    </div>
                    <p className="sentiment-description">{aiAnalysis.sentiment.toneDescription || ''}</p>
                    <div className="emotion-tags">
                      {(aiAnalysis.sentiment.emotions || []).map((emotion, idx) => (
                        <span key={idx} className="emotion-tag">{emotion}</span>
                      ))}
                    </div>
                  </div>
                </ChartCard>
              )}

              {/* Content Themes */}
              {aiAnalysis.themes && aiAnalysis.themes.length > 0 && (
                <ChartCard title="Content Themes" subtitle="AI-detected topic categories">
                  <div className="chart-container" style={{ height: 200, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie
                          data={aiAnalysis.themes.map(t => ({ ...t, percentage: t.percentage, theme: t.theme, color: t.color }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="percentage"
                          nameKey="theme"
                        >
                          {aiAnalysis.themes.map((theme, index) => (
                            <Cell key={`theme-${index}`} fill={theme.color || '#6B7280'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="themes-legend">
                    {aiAnalysis.themes.map((theme) => (
                      <div key={theme.theme} className="theme-item">
                        <span className="theme-dot" style={{ background: theme.color || '#6B7280' }} />
                        <span className="theme-name">{theme.theme}</span>
                        <span className="theme-percent">{theme.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}

              {/* Caption Style */}
              {aiAnalysis.captionStyle && (
                <ChartCard title="Caption Style" subtitle="Writing patterns detected">
                  <div className="style-grid">
                    <div className="style-item">
                      <span className="style-label">Avg Length</span>
                      <span className="style-value">{aiAnalysis.captionStyle.avgLength || 'N/A'}</span>
                    </div>
                    <div className="style-item">
                      <span className="style-label">Uses Emoji</span>
                      <span className={`style-badge ${aiAnalysis.captionStyle.usesEmoji ? 'yes' : 'no'}`}>
                        {aiAnalysis.captionStyle.usesEmoji ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="style-item">
                      <span className="style-label">Uses CTA</span>
                      <span className={`style-badge ${aiAnalysis.captionStyle.usesCTA ? 'yes' : 'no'}`}>
                        {aiAnalysis.captionStyle.usesCTA ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="style-item">
                      <span className="style-label">Uses Questions</span>
                      <span className={`style-badge ${aiAnalysis.captionStyle.usesQuestions ? 'yes' : 'no'}`}>
                        {aiAnalysis.captionStyle.usesQuestions ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </ChartCard>
              )}

              {/* AI Recommendations */}
              {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                <ChartCard title="AI Recommendations" subtitle="Suggestions to improve content">
                  <div className="recommendations-list">
                    {aiAnalysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="recommendation-item">
                        <Lightbulb size={16} className="rec-icon" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}
            </div>
          )}
        </div>
      )}

      {/* Top Posts */}
      <ChartCard title="Top Performing Posts" subtitle="Sorted by engagement (likes + comments)">
        <div className="posts-grid">
          {[...data.posts]
            .sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount))
            .slice(0, 9)
            .map((post) => (
              <div key={post.id} className="post-card">
                <img src={post.thumbnail} alt="" />
                <div className="post-type-badge">
                  {getTypeIcon(post.type)}
                  {post.type}
                </div>
                <div className="post-overlay">
                  <div className="post-stat">
                    <Heart size={16} />
                    {formatNumber(post.likesCount)}
                  </div>
                  <div className="post-stat">
                    <MessageCircle size={16} />
                    {formatNumber(post.commentsCount)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </ChartCard>

      <style>{`
        .analyze-page {
          max-width: 1200px;
        }

        .analyze-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: var(--font-size-sm);
          transition: color var(--transition-fast);
        }

        .back-button:hover {
          color: var(--accent-instagram);
        }

        .mock-data-badge {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          background: var(--accent-amber-light);
          color: var(--accent-amber);
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: 9999px;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: #FEF2F2;
          color: #DC2626;
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          font-size: var(--font-size-sm);
        }

        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: var(--spacing-md);
          color: var(--text-secondary);
          text-align: center;
        }

        .error-state h2 {
          color: var(--text-primary);
        }

        .back-link {
          color: var(--accent-instagram);
          text-decoration: none;
          margin-top: var(--spacing-md);
        }

        .profile-section {
          margin-bottom: var(--spacing-xl);
        }

        .profile-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-xl);
        }

        .profile-avatar {
          position: relative;
          flex-shrink: 0;
        }

        .profile-avatar img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid transparent;
          background: linear-gradient(var(--bg-primary), var(--bg-primary)) padding-box,
                      linear-gradient(135deg, #833AB4, #E1306C, #F77737) border-box;
        }

        .verified-badge {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: #3B82F6;
          color: white;
          border-radius: 50%;
          padding: 2px;
          border: 2px solid white;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name-row {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
        }

        .profile-name-row h1 {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
        }

        .category-badge {
          background: var(--bg-secondary);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: 9999px;
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .profile-bio {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }

        .profile-website {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--accent-instagram);
          text-decoration: none;
          font-size: var(--font-size-sm);
        }

        .profile-stats {
          display: flex;
          gap: var(--spacing-xl);
        }

        .profile-stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .engagement-score-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .score-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-md);
        }

        .score-content h3 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
        }

        .score-content p {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .score-badge {
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: 9999px;
          color: white;
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-sm);
        }

        .score-bar {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: var(--spacing-sm);
        }

        .score-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 1s ease;
        }

        .score-labels {
          display: flex;
          justify-content: space-between;
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
        }

        .legend-row {
          display: flex;
          justify-content: center;
          gap: var(--spacing-lg);
          margin-top: var(--spacing-md);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .hashtags-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-sm);
        }

        .hashtag-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .hashtag-rank {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
          font-weight: var(--font-weight-semibold);
        }

        .hashtag-name {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          font-weight: var(--font-weight-medium);
          color: var(--accent-instagram);
        }

        .hashtag-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .hashtag-count {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
        }

        .hashtag-engagement {
          font-size: var(--font-size-xs);
          color: var(--accent-green);
          font-weight: var(--font-weight-medium);
        }

        .mentions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }

        .mention-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .mention-rank {
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          font-weight: var(--font-weight-semibold);
          min-width: 24px;
        }

        .mention-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mention-username {
          font-weight: var(--font-weight-semibold);
          color: var(--accent-instagram);
        }

        .mention-count {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
        }

        .mention-engagement {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .engagement-label {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
        }

        .engagement-value {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--accent-green);
        }

        /* AI Insights Styles */
        .ai-section {
          margin: var(--spacing-xl) 0;
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, rgba(131, 58, 180, 0.05), rgba(225, 48, 108, 0.05));
          border-radius: var(--radius-xl);
          border: 1px solid rgba(225, 48, 108, 0.2);
        }

        .ai-section-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .ai-section-header h2 {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          background: linear-gradient(135deg, #833AB4, #E1306C);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ai-icon {
          color: #E1306C;
        }

        .ai-loading {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-secondary);
        }

        .ai-insights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg);
        }

        .sentiment-card {
          text-align: center;
          padding: var(--spacing-lg);
        }

        .sentiment-badge {
          display: inline-block;
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: 9999px;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-sm);
          color: white;
          margin-bottom: var(--spacing-md);
        }

        .sentiment-positive { background: var(--accent-green); }
        .sentiment-neutral { background: var(--accent-blue); }
        .sentiment-negative { background: var(--accent-instagram); }

        .sentiment-score {
          margin-bottom: var(--spacing-md);
        }

        .score-number {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
        }

        .score-label {
          font-size: var(--font-size-lg);
          color: var(--text-tertiary);
        }

        .sentiment-description {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          margin-bottom: var(--spacing-md);
        }

        .emotion-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--spacing-xs);
        }

        .emotion-tag {
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: 9999px;
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .themes-legend {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .theme-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .theme-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .theme-name {
          flex: 1;
          font-size: var(--font-size-sm);
        }

        .theme-percent {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--text-secondary);
        }

        .style-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }

        .style-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .style-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .style-value {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          text-transform: capitalize;
        }

        .style-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: 9999px;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }

        .style-badge.yes {
          background: rgba(16, 185, 129, 0.1);
          color: var(--accent-green);
        }

        .style-badge.no {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .recommendation-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .rec-icon {
          color: var(--accent-amber);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .recommendation-item span {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 1024px) {
          .ai-insights-grid {
            grid-template-columns: 1fr;
          }
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
        }

        .post-card {
          aspect-ratio: 1;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          cursor: pointer;
        }

        .post-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .post-type-badge {
          position: absolute;
          top: var(--spacing-sm);
          left: var(--spacing-sm);
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .post-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-lg);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .post-card:hover .post-overlay {
          opacity: 1;
        }

        .post-stat {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: white;
          font-weight: var(--font-weight-semibold);
        }

        @media (max-width: 1024px) {
          .hashtags-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .profile-card {
            flex-direction: column;
            text-align: center;
          }

          .profile-name-row {
            justify-content: center;
            flex-wrap: wrap;
          }

          .profile-stats {
            justify-content: center;
          }

          .posts-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .hashtags-grid {
            grid-template-columns: 1fr;
          }

          .analyze-header {
            flex-direction: column;
            gap: var(--spacing-sm);
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
