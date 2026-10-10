import React, { useId } from "react";
import { buildChartPoints, pointsToPath, pointsToArea } from "../utils/chartUtils";

export function ActivityChart({ labels = [], primaryValues = [], secondaryValues = [] }) {
  const gradientId = `activity-${useId().replace(/:/g, "")}`;
  const width = 660;
  const height = 250;
  const padding = 18;
  const maxValue = Math.max(Math.max(...primaryValues, ...secondaryValues) * 1.15, 1);
  const primaryPoints = buildChartPoints(primaryValues, width, height, padding, maxValue);
  const secondaryPoints = buildChartPoints(secondaryValues, width, height, padding, maxValue);
  const innerWidth = width - padding * 2;

  return (
    <div className="activity-chart">
      <svg className="activity-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="User activity chart">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#885F9A" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#885F9A" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {labels.map((label, index) => {
          const x = labels.length === 1 ? width / 2 : padding + (innerWidth / (labels.length - 1)) * index;
          return <line key={label} x1={x} y1={padding} x2={x} y2={height - padding} className="chart-grid-line" />;
        })}

        <path d={pointsToArea(primaryPoints, height, padding)} className="chart-area" style={{ fill: `url(#${gradientId})` }} />
        <path d={pointsToPath(primaryPoints)} className="chart-line chart-line-primary" />
        <path d={pointsToPath(secondaryPoints)} className="chart-line chart-line-secondary" />

        {primaryPoints.map((point, index) => (
          <circle key={`p-${index}`} cx={point.x} cy={point.y} r={4} className="chart-dot chart-dot-primary"><title>{labels[index]}: {primaryValues[index]} active users</title></circle>
        ))}
        {secondaryPoints.map((point, index) => (
          <circle key={`s-${index}`} cx={point.x} cy={point.y} r={4} className="chart-dot chart-dot-secondary"><title>{labels[index]}: {secondaryValues[index]} new registrations</title></circle>
        ))}
      </svg>

      <div className="chart-labels" style={{ position: 'relative', height: '20px', width: '100%' }}>
        {labels.map((label, index) => {
          const x = labels.length === 1 ? width / 2 : padding + (innerWidth / (labels.length - 1)) * index;
          const xPercent = (x / width) * 100;
          return (
            <span 
              key={label} 
              style={{ 
                position: 'absolute', 
                left: `${xPercent}%`, 
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div className="chart-legend">
        <span className={primaryValues.length ? "" : "dsh-legend-unavailable"}>
          <i className="legend-dot legend-dot-primary" />
          Active Users{!primaryValues.length && " (unavailable)"}
        </span>
        <span>
          <i className="legend-dot legend-dot-secondary" />
          New Registrations
        </span>
      </div>
    </div>
  );
}
