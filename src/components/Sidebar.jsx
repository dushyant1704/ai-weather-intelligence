import React from 'react'
import {
  CloudSun,
  LayoutDashboard,
  LineChart,
  CalendarDays,
  Star,
  History,
  AlertTriangle,
  GitCompare,
  SlidersHorizontal,
  BrainCircuit,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const Sidebar = ({ activeTab, onSelectTab, isCollapsed, onToggleCollapse }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ai', label: 'AI Intelligence', icon: BrainCircuit },
    { id: 'insights', label: 'Weather Insights', icon: LineChart },
    { id: 'forecast', label: 'Forecast', icon: CalendarDays },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recent', label: 'Recent Searches', icon: History },
    { id: 'alerts', label: 'Weather Alerts', icon: AlertTriangle },
    { id: 'comparison', label: 'City Compare', icon: GitCompare },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal }
  ]

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <CloudSun className="logo-svg" size={28} />
        </div>
        {!isCollapsed && <span className="brand-title">WeatherPulse</span>}
        <button
          className="collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
            >
              <Icon className="nav-icon" size={20} />
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {isActive && <div className="active-indicator" />}
            </button>
          )
        })}
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer-card">
          <div className="live-status-dot" />
          <div className="status-text">
            <span className="status-title">Live Data API</span>
            <span className="status-desc">OpenWeather & OpenMeteo</span>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
