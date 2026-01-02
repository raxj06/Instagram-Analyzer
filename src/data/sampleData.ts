// Sample data for Instagram Analyzer Dashboard
// Simulates data returned from Business Discovery API

export interface InstagramProfile {
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
}

export interface InstagramPost {
    id: string;
    type: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REEL';
    thumbnail: string;
    caption: string;
    likesCount: number;
    commentsCount: number;
    timestamp: string;
    hashtags: string[];
    mentions: string[];
}

export interface AnalysisResult {
    profile: InstagramProfile;
    posts: InstagramPost[];
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
        topHashtags: { tag: string; count: number; avgEngagement: number }[];
        topMentions: { username: string; count: number; avgEngagement: number }[];
        postingDays: { day: string; count: number }[];
        postingHours: { hour: number; count: number }[];
    };
}

// Sample analyzed account data
export const sampleAnalysis: AnalysisResult = {
    profile: {
        username: 'nike',
        name: 'Nike',
        bio: 'Just Do It. #Nike',
        website: 'nike.com',
        followersCount: 306000000,
        followingCount: 142,
        mediaCount: 1247,
        profilePicture: 'https://picsum.photos/seed/nike/150/150',
        isVerified: true,
        category: 'Sports & Recreation',
    },
    posts: [
        {
            id: '1',
            type: 'REEL',
            thumbnail: 'https://picsum.photos/seed/nike1/400/400',
            caption: 'Victory is in the mind. 🏆 #JustDoIt #Nike #Motivation',
            likesCount: 892450,
            commentsCount: 4521,
            timestamp: '2024-12-30T14:00:00Z',
            hashtags: ['JustDoIt', 'Nike', 'Motivation'],
            mentions: [],
        },
        {
            id: '2',
            type: 'CAROUSEL',
            thumbnail: 'https://picsum.photos/seed/nike2/400/400',
            caption: 'New year. New goals. Same determination. 💪 #Nike2025',
            likesCount: 756230,
            commentsCount: 3892,
            timestamp: '2024-12-28T16:30:00Z',
            hashtags: ['Nike2025'],
            mentions: [],
        },
        {
            id: '3',
            type: 'IMAGE',
            thumbnail: 'https://picsum.photos/seed/nike3/400/400',
            caption: 'Legends never stop. @lebronjames bringing the heat 🔥',
            likesCount: 1245000,
            commentsCount: 8923,
            timestamp: '2024-12-26T12:00:00Z',
            hashtags: [],
            mentions: ['lebronjames'],
        },
        {
            id: '4',
            type: 'REEL',
            thumbnail: 'https://picsum.photos/seed/nike4/400/400',
            caption: 'Every champion was once a beginner. Start today. #Training #Nike',
            likesCount: 654320,
            commentsCount: 2341,
            timestamp: '2024-12-24T10:00:00Z',
            hashtags: ['Training', 'Nike'],
            mentions: [],
        },
        {
            id: '5',
            type: 'REEL',
            thumbnail: 'https://picsum.photos/seed/nike5/400/400',
            caption: 'Air Max: Redefining comfort since 1987 👟 #AirMax #Sneakers',
            likesCount: 534210,
            commentsCount: 1892,
            timestamp: '2024-12-22T15:00:00Z',
            hashtags: ['AirMax', 'Sneakers'],
            mentions: [],
        },
        {
            id: '6',
            type: 'IMAGE',
            thumbnail: 'https://picsum.photos/seed/nike6/400/400',
            caption: 'Built different. @seraborsa x Nike collection 🎾',
            likesCount: 423890,
            commentsCount: 1567,
            timestamp: '2024-12-20T11:00:00Z',
            hashtags: [],
            mentions: ['seraborsa'],
        },
        {
            id: '7',
            type: 'CAROUSEL',
            thumbnail: 'https://picsum.photos/seed/nike7/400/400',
            caption: 'Winter collection is here ❄️ Swipe to explore #NikeWinter',
            likesCount: 389450,
            commentsCount: 1234,
            timestamp: '2024-12-18T09:00:00Z',
            hashtags: ['NikeWinter'],
            mentions: [],
        },
        {
            id: '8',
            type: 'REEL',
            thumbnail: 'https://picsum.photos/seed/nike8/400/400',
            caption: 'Run your world. 🌍 #NikeRunning #Marathon',
            likesCount: 567890,
            commentsCount: 2890,
            timestamp: '2024-12-16T13:00:00Z',
            hashtags: ['NikeRunning', 'Marathon'],
            mentions: [],
        },
        {
            id: '9',
            type: 'IMAGE',
            thumbnail: 'https://picsum.photos/seed/nike9/400/400',
            caption: 'Court ready. Always. 🏀 #Basketball #Nike',
            likesCount: 445670,
            commentsCount: 1456,
            timestamp: '2024-12-14T17:00:00Z',
            hashtags: ['Basketball', 'Nike'],
            mentions: [],
        },
    ],
    metrics: {
        engagementRate: 2.8,
        avgLikesPerPost: 612345,
        avgCommentsPerPost: 3190,
        postsPerWeek: 4.2,
        contentMix: {
            images: 22,
            videos: 8,
            carousels: 25,
            reels: 45,
        },
        topHashtags: [
            { tag: 'JustDoIt', count: 156, avgEngagement: 892450 },
            { tag: 'Nike', count: 142, avgEngagement: 756230 },
            { tag: 'NikeRunning', count: 78, avgEngagement: 654320 },
            { tag: 'AirMax', count: 65, avgEngagement: 534210 },
            { tag: 'Training', count: 54, avgEngagement: 445670 },
            { tag: 'Motivation', count: 48, avgEngagement: 423890 },
            { tag: 'Basketball', count: 42, avgEngagement: 389450 },
            { tag: 'Sneakers', count: 38, avgEngagement: 367890 },
        ],
        topMentions: [
            { username: 'lebronjames', count: 12, avgEngagement: 1245000 },
            { username: 'serenaWilliams', count: 8, avgEngagement: 987000 },
            { username: 'cristiano', count: 6, avgEngagement: 856000 },
            { username: 'neymarjr', count: 5, avgEngagement: 723000 },
            { username: 'kingjames', count: 4, avgEngagement: 654000 },
        ],
        postingDays: [
            { day: 'Mon', count: 42 },
            { day: 'Tue', count: 38 },
            { day: 'Wed', count: 45 },
            { day: 'Thu', count: 52 },
            { day: 'Fri', count: 48 },
            { day: 'Sat', count: 35 },
            { day: 'Sun', count: 28 },
        ],
        postingHours: [
            { hour: 9, count: 45 },
            { hour: 10, count: 52 },
            { hour: 11, count: 38 },
            { hour: 12, count: 62 },
            { hour: 13, count: 48 },
            { hour: 14, count: 55 },
            { hour: 15, count: 42 },
            { hour: 16, count: 58 },
            { hour: 17, count: 35 },
        ],
    },
};

// Recent searches
export const recentSearches = [
    { username: 'nike', name: 'Nike', followers: 306000000 },
    { username: 'adidas', name: 'Adidas', followers: 28500000 },
    { username: 'puma', name: 'PUMA', followers: 12400000 },
];

// Format large numbers
export const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

// Calculate engagement rate
export const calculateEngagementRate = (
    likes: number,
    comments: number,
    followers: number
): number => {
    return ((likes + comments) / followers) * 100;
};

// Get engagement rating
export const getEngagementRating = (rate: number): { label: string; color: string } => {
    if (rate >= 6) return { label: 'Excellent', color: 'var(--accent-green)' };
    if (rate >= 3) return { label: 'Good', color: 'var(--accent-blue)' };
    if (rate >= 1) return { label: 'Average', color: 'var(--accent-amber)' };
    return { label: 'Low', color: 'var(--accent-instagram)' };
};
