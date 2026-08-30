import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';

interface RulersOverlayProps {
  zoom: number;
  panX: number;
  panY: number;
}

export const RulersOverlay: React.FC<RulersOverlayProps> = ({ zoom, panX, panY }) => {
  const { theme } = useProjectStore();
  const isDark = theme === 'dark';
  const majorTicks = [];
  const minorTicks = [];

  // Generate top horizontal ticks
  for (let x = -2000; x <= 4000; x += 50) {
    const screenX = x * zoom + panX;
    if (screenX >= 0 && screenX <= window.innerWidth) {
      majorTicks.push({ pos: screenX, val: x });
    }
  }

  // Generate left vertical ticks
  for (let y = -2000; y <= 4000; y += 50) {
    const screenY = y * zoom + panY;
    if (screenY >= 0 && screenY <= window.innerHeight) {
      minorTicks.push({ pos: screenY, val: y });
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden">
      {/* Top Horizontal Ruler */}
      <div className={`absolute top-0 left-0 right-0 h-5 border-b flex items-center transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <svg className={`w-full h-full text-[9px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {majorTicks.map((t) => (
            <g key={`h_${t.val}`} transform={`translate(${t.pos}, 0)`}>
              <line x1="0" y1="12" x2="0" y2="20" stroke="currentColor" strokeWidth="1" />
              <text x="3" y="10" fill="currentColor">
                {t.val}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Left Vertical Ruler */}
      <div className={`absolute top-5 left-0 bottom-0 w-5 border-r flex justify-center transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <svg className={`w-full h-full text-[9px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {minorTicks.map((t) => (
            <g key={`v_${t.val}`} transform={`translate(0, ${t.pos - 20})`}>
              <line x1="12" y1="0" x2="20" y2="0" stroke="currentColor" strokeWidth="1" />
              <text x="2" y="-3" fill="currentColor" transform="rotate(-90 2, -3)">
                {t.val}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Origin Corner Box */}
      <div className={`absolute top-0 left-0 w-5 h-5 border-r border-b flex items-center justify-center text-[9px] font-mono transition-colors ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'
      }`}>
        px
      </div>
    </div>
  );
};
