import React from 'react'

const LoadingSkeleton = () => {
  return (
    <div className="skeleton-dashboard">
      {/* Hero Skeleton */}
      <div className="skeleton-hero-card">
        <div className="skeleton-line title-skeleton" />
        <div className="skeleton-line sub-skeleton" />
        <div className="skeleton-circle hero-circle-skeleton" />
      </div>

      {/* KPI Grid Skeleton */}
      <div className="skeleton-kpi-grid">
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div key={n} className="skeleton-kpi-card">
            <div className="skeleton-line kpi-head-skeleton" />
            <div className="skeleton-line kpi-val-skeleton" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="skeleton-chart-box">
        <div className="skeleton-line chart-title-skeleton" />
        <div className="skeleton-area-placeholder" />
      </div>
    </div>
  )
}

export default LoadingSkeleton
