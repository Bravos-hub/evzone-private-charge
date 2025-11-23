import React from 'react';

export default function Sparkline({ data = [], stroke = '#03cd8c', fill = 'rgba(3,205,140,.18)' }) {
  const W = 100, H = 36, P = 4;
  if (!data.length) return null;
  const max = Math.max(...data);
  const step = (W - P * 2) / (data.length - 1);
  const x = (i) => P + i * step;
  const y = (v) => H - P - (v / (max || 1)) * (H - P * 2);
  const d = data.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(v)}`).join(' ');
  const area = `${d} L ${x(data.length - 1)} ${H - P} L ${x(0)} ${H - P} Z`;
  
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden>
      <path d={area} fill={fill} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

