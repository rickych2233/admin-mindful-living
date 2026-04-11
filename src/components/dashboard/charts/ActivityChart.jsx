import React from "react";
import { buildChartPoints, pointsToPath, pointsToArea } from "../utils/chartUtils";

export function ActivityChart({ labels, primaryValues, secondaryValues }) {
  const width = 660;
  const height = 250;
  const padding = 18;
  const maxValue = Math.max(...primaryValues, ...secondaryValues) * 1.15;
  const primaryPoints = buildChartPoints(primaryValues, width, height, padding, maxValue);
  const secondaryPoints = buildChartPoints(secondaryValues, width, height, padding, maxValue);
  const innerWidth = width - padding * 2;

  return (
    <div className="activity-chart">
      <svg className="activity-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="User activity chart">
        {labels.map((label, index) => {
          const x = labels.length === 1 ? width / 2 : padding + (innerWidth / (labels.length - 1)) * index;
          return <line key={label} x1={x} y1={padding} x2={x} y2={height - padding} className="chart-grid-line" />;
        })}

        <path d={pointsToArea(primaryPoints, height, padding)} className="chart-area" />
        <path d={pointsToPath(primaryPoints)} className="chart-line chart-line-primary" />
        <path d={pointsToPath(secondaryPoints)} className="chart-line chart-line-secondary" />
      </svg>

      <div className="chart-labels">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="chart-legend">
        <span>
          <i className="legend-dot legend-dot-primary" />
          Active Users
        </span>
        <span>
          <i className="legend-dot legend-dot-secondary" />
          New Registrations
        </span>
      </div>
    </div>
  );
}