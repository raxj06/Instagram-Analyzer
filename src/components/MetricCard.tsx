import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
    icon: ReactNode
    iconColor: 'pink' | 'blue' | 'green' | 'amber' | 'purple'
    label: string
    value: string | number
    change?: number
    changeLabel?: string
}

export default function MetricCard({
    icon,
    iconColor,
    label,
    value,
    change,
    changeLabel = 'vs last period'
}: MetricCardProps) {
    const formatValue = (val: string | number) => {
        if (typeof val === 'number') {
            if (val >= 1000000) {
                return (val / 1000000).toFixed(1) + 'M'
            } else if (val >= 1000) {
                return (val / 1000).toFixed(1) + 'K'
            }
            return val.toLocaleString()
        }
        return val
    }

    return (
        <div className="metric-card">
            <div className={`metric-icon ${iconColor}`}>
                {icon}
            </div>
            <span className="metric-label">{label}</span>
            <span className="metric-value">{formatValue(value)}</span>
            {change !== undefined && (
                <div className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
                    {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(change)}%</span>
                    <span style={{ color: 'var(--text-tertiary)', marginLeft: '4px' }}>{changeLabel}</span>
                </div>
            )}
        </div>
    )
}
