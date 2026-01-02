// Instagram Graph API Service
// Uses Business Discovery to fetch public profile data

const INSTAGRAM_ACCOUNT_ID = import.meta.env.VITE_INSTAGRAM_ACCOUNT_ID;
const ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN;
const API_BASE = 'https://graph.facebook.com/v18.0';

export interface InstagramMedia {
    id: string;
    caption?: string;
    like_count: number;
    comments_count: number;
    timestamp: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url?: string;
    thumbnail_url?: string;
    permalink: string;
    // Collaborations/Tags (Experimental)
    user_tags?: {
        data: Array<{
            user: {
                id: string;
                username: string;
            };
            x: number;
            y: number;
        }>;
    };
    view_count?: number; // Added for video engagement calculation
}

export interface InstagramProfile {
    username: string;
    name: string;
    biography: string;
    website: string;
    followers_count: number;
    follows_count: number;
    media_count: number;
    profile_picture_url: string;
    id: string;
}

export interface BusinessDiscoveryResponse {
    business_discovery: InstagramProfile & {
        media: {
            data: InstagramMedia[];
        };
    };
}

// Matching AnalysisResult from sampleData.ts
export interface AnalyzedProfile {
    profile: {
        username: string;
        name: string;
        bio: string;
        website: string;
        followersCount: number;
        followingCount: number;
        mediaCount: number;
        profilePicture: string;
        isVerified: boolean;
        category: string;
    };
    posts: Array<{
        id: string;
        type: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REEL';
        thumbnail: string;
        caption: string;
        likesCount: number;
        commentsCount: number;
        timestamp: string;
        url: string;
        hashtags: string[];
        mentions: string[];
    }>;
    metrics: {
        engagementRate: number;
        avgLikesPerPost: number;
        avgCommentsPerPost: number;
        postsPerWeek: number;
        contentMix: {
            images: number;
            videos: number;
            carousels: number;
            reels: number;
        };
        topHashtags: Array<{ tag: string; count: number; avgEngagement: number }>;
        topMentions: Array<{ username: string; count: number; avgEngagement: number }>;
        postingDays: Array<{ day: string; count: number }>;
        postingHours: Array<{ hour: number; count: number }>;
    };
}

// Extract hashtags from caption
function extractHashtags(caption: string): string[] {
    const matches = caption.match(/#[\w]+/g);
    return matches ? matches.map(tag => tag.slice(1)) : [];
}

// Extract mentions from caption
function extractMentions(caption: string): string[] {
    const matches = caption.match(/@[\w.]+/g);
    return matches ? matches.map(mention => mention.slice(1)) : [];
}

// Get day name from date
function getDayName(date: Date): string {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

// Calculate metrics from posts
function calculateMetrics(posts: InstagramMedia[], followersCount: number) {
    const totalLikes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);

    const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
    const avgComments = posts.length > 0 ? Math.round(totalComments / posts.length) : 0;

    // Engagement Rate Calculation
    // User Formula: (Likes + Comments) / Views
    // Fallback: If view_count is unavailable (Images), use Followers (Standard Industry Proxy).
    let totalEngagementRate = 0;

    posts.forEach(post => {
        const engagement = (post.like_count || 0) + (post.comments_count || 0);
        // Use view_count if available (Reels), otherwise followers_count
        // Ensure denominator is at least 1 to avoid Infinity
        const denominator = (post.view_count && post.view_count > 0) ? post.view_count : (followersCount || 1);

        const rate = (engagement / denominator) * 100;
        totalEngagementRate += rate;
    });

    // Average Engagement Rate across last X posts
    const engagementRate = posts.length > 0
        ? Number((totalEngagementRate / posts.length).toFixed(2))
        : 0;

    // Content mix
    const contentMix = { images: 0, videos: 0, carousels: 0, reels: 0 };
    posts.forEach(post => {
        switch (post.media_type) {
            case 'IMAGE': contentMix.images++; break;
            case 'VIDEO': contentMix.videos++; break;
            case 'CAROUSEL_ALBUM': contentMix.carousels++; break;
        }
    });

    // Convert to percentages
    const total = posts.length || 1;
    contentMix.images = Math.round((contentMix.images / total) * 100);
    contentMix.videos = Math.round((contentMix.videos / total) * 100);
    contentMix.carousels = Math.round((contentMix.carousels / total) * 100);
    contentMix.reels = 100 - contentMix.images - contentMix.videos - contentMix.carousels;

    // Hashtag analysis with engagement
    const hashtagData: Record<string, { count: number; totalEngagement: number }> = {};
    posts.forEach(post => {
        const hashtags = extractHashtags(post.caption || '');
        const postEngagement = (post.like_count || 0) + (post.comments_count || 0);
        hashtags.forEach(tag => {
            const normalizedTag = tag.toLowerCase();
            if (!hashtagData[normalizedTag]) {
                hashtagData[normalizedTag] = { count: 0, totalEngagement: 0 };
            }
            hashtagData[normalizedTag].count++;
            hashtagData[normalizedTag].totalEngagement += postEngagement;
        });
    });
    const topHashtags = Object.entries(hashtagData)
        .map(([tag, data]) => ({
            tag,
            count: data.count,
            avgEngagement: Math.round(data.totalEngagement / data.count)
        }))
        .sort((a, b) => b.avgEngagement - a.avgEngagement) // Sort by engagement, not count
        .slice(0, 8);

    // Mention/Collab Network analysis
    const mentionData: Record<string, { count: number; totalEngagement: number }> = {};
    posts.forEach(post => {
        // Get mentions from caption
        const captionMentions = extractMentions(post.caption || '');

        // Get tags from media (collaborations often appear here)
        const userTags = post.user_tags?.data.map(tag => tag.user.username) || [];

        // Combine unique mentions
        const uniqueMentions = Array.from(new Set([...captionMentions, ...userTags]));

        const postEngagement = (post.like_count || 0) + (post.comments_count || 0);

        uniqueMentions.forEach(mention => {
            const normalizedMention = mention.toLowerCase();
            if (!mentionData[normalizedMention]) {
                mentionData[normalizedMention] = { count: 0, totalEngagement: 0 };
            }
            mentionData[normalizedMention].count++;
            mentionData[normalizedMention].totalEngagement += postEngagement;
        });
    });
    const topMentions = Object.entries(mentionData)
        .map(([username, data]) => ({
            username,
            count: data.count,
            avgEngagement: Math.round(data.totalEngagement / data.count)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Posting days analysis
    const dayCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const hourCounts: Record<number, number> = {};

    posts.forEach(post => {
        const date = new Date(post.timestamp);
        const day = getDayName(date);
        const hour = date.getHours();

        dayCounts[day] = (dayCounts[day] || 0) + 1;
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const postingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        day,
        count: dayCounts[day] || 0
    }));

    const postingHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => a.hour - b.hour);

    // Posts per week (based on date range of fetched posts)
    let postsPerWeek = 0;
    if (posts.length > 1) {
        const firstPost = new Date(posts[posts.length - 1].timestamp);
        const lastPost = new Date(posts[0].timestamp);
        const weeks = Math.max(1, (lastPost.getTime() - firstPost.getTime()) / (7 * 24 * 60 * 60 * 1000));
        postsPerWeek = Number((posts.length / weeks).toFixed(1));
    }

    return {
        engagementRate,
        avgLikesPerPost: avgLikes,
        avgCommentsPerPost: avgComments,
        postsPerWeek,
        contentMix,
        topHashtags,
        topMentions,
        postingDays,
        postingHours,
    };
}

// Main function to fetch and analyze a profile
export async function analyzeInstagramProfile(username: string): Promise<AnalyzedProfile> {
    if (!INSTAGRAM_ACCOUNT_ID || !ACCESS_TOKEN) {
        throw new Error('Instagram API credentials not configured. Please add VITE_INSTAGRAM_ACCOUNT_ID and VITE_FACEBOOK_ACCESS_TOKEN to your .env file.');
    }

    // Build the API URL for Business Discovery
    // Note: user_tags field requested for collaboration detection
    const fields = `
    business_discovery.username(${username}){
      username,
      name,
      biography,
      website,
      followers_count,
      follows_count,
      media_count,
      profile_picture_url,
      media.limit(25){
        id,
        caption,
        like_count,
        comments_count,
        timestamp,
        thumbnail_url,
        permalink,
        user_tags,
        media_type,
        media_product_type
      }
    }
  `.replace(/\s+/g, '');

    // Add view_count to request (sometimes requires extra permissions but worth a try)
    const fieldsWithViews = fields.replace('user_tags', 'user_tags,view_count');

    const url = `${API_BASE}/${INSTAGRAM_ACCOUNT_ID}?fields=${fieldsWithViews}&access_token=${ACCESS_TOKEN}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const error = await response.json();
            console.error('Facebook API Response:', error);

            // Handle specific error codes
            if (error.error?.code === 100) {
                throw new Error(`Account @${username} not found or is not a Business/Creator account.`);
            }
            if (error.error?.code === 190) {
                throw new Error('Access token expired. Please generate a new token.');
            }
            if (error.error?.code === 10) {
                throw new Error('Missing permissions. Ensure your app has instagram_basic permission.');
            }

            throw new Error(error.error?.message || `API Error: ${response.status}`);
        }

        const data: BusinessDiscoveryResponse = await response.json();
        const profile = data.business_discovery;
        const media = profile.media?.data || [];

        // Transform posts
        const posts = media.map(post => {
            const rawTags = post.user_tags?.data || [];
            const tags = rawTags.map(t => t.user.username);
            console.log(`Post ${post.id}: Found ${tags.length} user_tags`, tags);

            return {
                id: post.id,
                type: post.media_type === 'CAROUSEL_ALBUM' ? 'CAROUSEL' as const :
                    post.media_type === 'VIDEO' ? 'REEL' as const :
                        'IMAGE' as const,
                thumbnail: post.thumbnail_url || post.media_url || `https://picsum.photos/seed/${post.id}/400/400`,
                caption: post.caption || '',
                likesCount: post.like_count || 0,
                commentsCount: post.comments_count || 0,
                timestamp: post.timestamp,
                url: post.permalink || `https://instagram.com/p/${post.id}`,
                hashtags: extractHashtags(post.caption || ''),
                mentions: [...extractMentions(post.caption || ''), ...tags],
            };
        });

        // Calculate metrics
        const metrics = calculateMetrics(media, profile.followers_count);

        return {
            profile: {
                username: profile.username,
                name: profile.name || profile.username,
                bio: profile.biography || '',
                website: profile.website || '',
                followersCount: profile.followers_count,
                followingCount: profile.follows_count,
                mediaCount: profile.media_count,
                profilePicture: profile.profile_picture_url || `https://picsum.photos/seed/${username}/150/150`,
                isVerified: false, // Not available via API
                category: 'Business', // Not available via Business Discovery
            },
            posts,
            metrics,
        };
    } catch (error) {
        console.error('Instagram API Error:', error);
        throw error;
    }
}

// Check if API is configured
export function isApiConfigured(): boolean {
    return !!(INSTAGRAM_ACCOUNT_ID && ACCESS_TOKEN);
}

// ==========================================
// HASHTAG SEARCH API
// ==========================================

export interface HashtagMedia {
    id: string;
    caption?: string;
    like_count?: number;
    comments_count?: number;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url?: string;
    permalink: string;
    timestamp: string;
}

export interface HashtagSearchResult {
    hashtagId: string;
    hashtagName: string;
    media: HashtagMedia[];
    mediaCount: number;
    avgLikes: number;
    avgComments: number;
}

// Search for a hashtag and get its ID
export async function searchHashtagId(hashtag: string): Promise<string | null> {
    if (!INSTAGRAM_ACCOUNT_ID || !ACCESS_TOKEN) {
        throw new Error('Instagram API credentials not configured.');
    }

    // Remove # if present and clean the hashtag
    const cleanHashtag = hashtag.replace(/^#/, '').trim().toLowerCase();

    const url = `${API_BASE}/ig_hashtag_search?user_id=${INSTAGRAM_ACCOUNT_ID}&q=${encodeURIComponent(cleanHashtag)}&access_token=${ACCESS_TOKEN}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('Hashtag search error:', data);
            throw new Error(data.error?.message || 'Failed to search hashtag');
        }

        if (data.data && data.data.length > 0) {
            return data.data[0].id;
        }

        return null;
    } catch (error) {
        console.error('Hashtag search error:', error);
        throw error;
    }
}

// Get media for a hashtag (top or recent)
export async function getHashtagMedia(
    hashtagId: string,
    type: 'top' | 'recent' = 'top',
    limit: number = 25
): Promise<HashtagMedia[]> {
    if (!INSTAGRAM_ACCOUNT_ID || !ACCESS_TOKEN) {
        throw new Error('Instagram API credentials not configured.');
    }

    const endpoint = type === 'top' ? 'top_media' : 'recent_media';
    const fields = 'id,caption,like_count,comments_count,media_type,media_url,permalink,timestamp';

    const url = `${API_BASE}/${hashtagId}/${endpoint}?user_id=${INSTAGRAM_ACCOUNT_ID}&fields=${fields}&limit=${limit}&access_token=${ACCESS_TOKEN}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('Hashtag media error:', data);
            throw new Error(data.error?.message || 'Failed to get hashtag media');
        }

        return data.data || [];
    } catch (error) {
        console.error('Hashtag media error:', error);
        throw error;
    }
}

// Full hashtag search with stats
export async function searchHashtag(hashtag: string, type: 'top' | 'recent' = 'top'): Promise<HashtagSearchResult> {
    const cleanHashtag = hashtag.replace(/^#/, '').trim().toLowerCase();

    // Step 1: Get hashtag ID
    const hashtagId = await searchHashtagId(cleanHashtag);

    if (!hashtagId) {
        throw new Error(`Hashtag #${cleanHashtag} not found`);
    }

    // Step 2: Get media
    const media = await getHashtagMedia(hashtagId, type, 30);

    // Step 3: Calculate stats
    const totalLikes = media.reduce((sum, m) => sum + (m.like_count || 0), 0);
    const totalComments = media.reduce((sum, m) => sum + (m.comments_count || 0), 0);

    return {
        hashtagId,
        hashtagName: cleanHashtag,
        media,
        mediaCount: media.length,
        avgLikes: media.length > 0 ? Math.round(totalLikes / media.length) : 0,
        avgComments: media.length > 0 ? Math.round(totalComments / media.length) : 0,
    };
}
