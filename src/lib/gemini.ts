// Gemini AI Service for Content Analysis (via n8n)
// Analyzes captions for sentiment and categorizes content themes

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export interface SentimentResult {
    overall: 'positive' | 'neutral' | 'negative';
    score: number; // 0-100
    emotions: string[];
    toneDescription: string;
}

export interface ContentTheme {
    theme: string;
    percentage: number;
    color: string;
}

export interface AIAnalysisResult {
    sentiment: SentimentResult;
    themes: ContentTheme[];
    captionStyle: {
        avgLength: 'short' | 'medium' | 'long';
        usesEmoji: boolean;
        usesCTA: boolean;
        usesQuestions: boolean;
    };
    recommendations: string[];
}



// Analyze captions via n8n webhook
export async function analyzeWithGemini(captions: string[]): Promise<AIAnalysisResult | null> {
    if (!N8N_WEBHOOK_URL) {
        console.warn('n8n webhook URL not configured (VITE_N8N_WEBHOOK_URL)');
        return null;
    }

    if (captions.length === 0) {
        return null;
    }

    try {
        console.log('Sending captions to n8n for AI analysis...');

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ captions: captions.slice(0, 15) }),
        });

        if (!response.ok) {
            console.error('n8n webhook error:', response.status);
            return null;
        }

        let result = await response.json();
        console.log('n8n raw response:', result);

        // n8n returns an array, get the first element
        if (Array.isArray(result)) {
            result = result[0];
        }

        // Vibrant colors for themes (index-based)
        const VIBRANT_COLORS = [
            '#E1306C', // Pink (Instagram)
            '#833AB4', // Purple
            '#10B981', // Green
            '#F77737', // Orange
            '#3B82F6', // Blue
            '#8B5CF6', // Violet
            '#EC4899', // Magenta
            '#6366F1', // Indigo
        ];

        // Add vibrant colors to themes based on index
        if (result.themes) {
            result.themes = result.themes.map((t: { theme: string; percentage: number; color?: string }, index: number) => ({
                ...t,
                color: VIBRANT_COLORS[index % VIBRANT_COLORS.length],
            }));
        }

        console.log('AI analysis complete!', result);
        return result;
    } catch (error) {
        console.error('n8n analysis error:', error);
        return null;
    }
}

// Check if n8n is configured
export function isGeminiConfigured(): boolean {
    return !!N8N_WEBHOOK_URL;
}
