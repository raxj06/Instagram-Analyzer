import { ReactNode } from 'react'

interface ChartCardProps {
    title: string
    subtitle?: string
    action?: ReactNode
    children: ReactNode
    className?: string
}

export default function ChartCard({
    title,
    subtitle,
    action,
    children,
    className = ''
}: ChartCardProps) {
    return (
        <div className={`card ${className}`}>
            <div className="card-header">
                <div>
                    <h3 className="card-title">{title}</h3>
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </div>
    )
}
