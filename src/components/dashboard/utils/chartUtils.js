export function buildChartPoints(values, width, height, padding, maxValue) {
  if (values.length === 0) {
    return [];
  }

  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const stepX = values.length === 1 ? 0 : innerWidth / (values.length - 1);

  return values.map((value, index) => {
    const x = padding + stepX * index;
    const y = height - padding - (value / maxValue) * innerHeight;
    return { x, y };
  });
}

export function pointsToPath(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function pointsToArea(points, height, padding) {
  if (points.length === 0) {
    return "";
  }

  const linePath = pointsToPath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  return `${linePath} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`;
}