import { sampleAccountInfo, sampleMetrics } from '../data/sampleData'

export default function AccountInfo() {
    const initials = sampleAccountInfo.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()

    return (
        <div className="account-info">
            <div className="account-avatar">
                {initials}
            </div>
            <div className="account-details">
                <h3>@{sampleAccountInfo.username}</h3>
                <p>{sampleAccountInfo.bio}</p>
            </div>
            <div className="account-stats">
                <div className="account-stat">
                    <div className="account-stat-value">
                        {(sampleMetrics.followers / 1000).toFixed(1)}K
                    </div>
                    <div className="account-stat-label">Followers</div>
                </div>
                <div className="account-stat">
                    <div className="account-stat-value">{sampleMetrics.following}</div>
                    <div className="account-stat-label">Following</div>
                </div>
                <div className="account-stat">
                    <div className="account-stat-value">{sampleMetrics.posts}</div>
                    <div className="account-stat-label">Posts</div>
                </div>
            </div>
        </div>
    )
}
