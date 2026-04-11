import React from "react";

export function DonutChart({ items }) {
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut-chart-shell">
      <svg className="donut-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Content mode preference chart">
        <circle
          className="donut-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {items.map((item) => {
            const dashLength = (item.value / 100) * circumference;
            const segment = (
              <circle
                key={item.label}
                className={`donut-segment donut-segment-${item.tone}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-offset}
              />
            );

            offset += dashLength;
            return segment;
          })}
        </g>
      </svg>

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