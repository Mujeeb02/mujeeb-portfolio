interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeClass?: string; // tailwind text-* color used via stroke="currentColor"
  fillClass?: string;
}

export const Sparkline = ({
  data,
  width = 120,
  height = 36,
  strokeClass = 'text-primary',
  fillClass = 'text-primary/15',
}: SparklineProps) => {
  if (!data.length) return <div style={{ width, height }} />;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={area} className={fillClass} fill="currentColor" />
      <path d={path} className={strokeClass} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};
