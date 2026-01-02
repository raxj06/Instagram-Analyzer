import { NavLink } from 'react-router-dom'
import {
    Search,
    TrendingUp,
    Instagram
} from 'lucide-react'

const navItems = [
    { path: '/', label: 'Search', icon: Search },
]

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="logo">
                <div className="logo-icon">
                    <Instagram size={20} />
                </div>
                <span className="logo-text">InstaAnalyzer</span>
            </div>

            <nav>
                <ul className="nav-menu">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-xl)' }}>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                        <TrendingUp size={16} style={{ color: 'var(--accent-instagram)' }} />
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Pro Tip</span>
                    </div>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Analyze competitor accounts to discover their content strategy and best performing posts.
                    </p>
                </div>
            </div>
        </aside>
    )
}
