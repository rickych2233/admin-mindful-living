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
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {items.map((item) => {
            // stroke-linecap="round" adds strokeWidth (28px) to the visible length (14px on each end).
            // To create a true 6px gap, we must subtract strokeWidth + 6 from the dashLength.
            const trueGap = 6;
            const gap = strokeWidth + trueGap; 
            const dashLength = (item.value / 100) * circumference;
            const visibleLength = Math.max(0, dashLength - gap);

            // We also need to offset the start so the rounded cap doesn't bleed backwards into the previous segment's space.
            // The segment starts at `offset`, but the round cap extends backward by strokeWidth/2.
            // If we add strokeWidth/2 + trueGap/2 to the offset, we center the gap!
            const segmentOffset = offset + (strokeWidth / 2) + (trueGap / 2);

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