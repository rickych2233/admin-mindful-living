import React from "react";

export function DonutChart({ items, center }) {
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut-chart-shell">
      <div className="donut-fig">
      <svg className="donut-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Content mode preference chart">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {/* Neutral track ring behind the segments (full circle) */}
          <circle
            className="donut-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {items.filter(item => item.value > 0).map((item) => {
            // Flat ends preserve small nonzero segments and leave a narrow gap.
            const gap = items.filter(item => item.value > 0).length > 1 ? 3 : 0;
            const dashLength = (item.value / 100) * circumference;
            const visibleLength = Math.max(0, dashLength - gap);

            const segmentOffset = offset + gap / 2;

            const segment = (
              <circle
                key={item.label}
                className={`donut-segment donut-segment-${item.tone}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={`${visibleLength} ${circumference - visibleLength}`}
                strokeDashoffset={-segmentOffset}
              />
            );

            offset += dashLength;
            return segment;
          })}
        </g>
      </svg>
      {center}
      </div>

      <div className="donut-legend">
        {items.map((item) => (
          <span key={item.label}>
            <i className={`legend-dot legend-dot-${item.tone}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
