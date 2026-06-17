import React, { useState } from 'react';
import type { LogEntry } from '../models/types';
import { Button } from './SharedUI';

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

// Helper to format category names
const formatLabel = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// --- ACCESSIBLE DONUT CHART ---
interface DonutChartProps {
  data: ChartDataPoint[];
  title: string;
  unit?: string;
}

export const AccessibleDonutChart: React.FC<DonutChartProps> = ({ data, title, unit = 'kg' }) => {
  const [viewTable, setViewTable] = useState(false);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // SVG parameters
  const radius = 50;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercent = 0;

  // Accessibility description
  const dataDescription = data
    .map(d => `${d.label}: ${d.value.toFixed(1)} ${unit} (${total > 0 ? Math.round((d.value / total) * 100) : 0}%)`)
    .join(', ');

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</h3>
        <Button
          variant="secondary"
          onClick={() => setViewTable(!viewTable)}
          ariaLabel={`Switch to ${viewTable ? 'chart' : 'table'} view for ${title}`}
          className="text-xs py-1 px-2.5"
        >
          {viewTable ? 'Show Chart' : 'Show Table'}
        </Button>
      </div>

      {viewTable ? (
        <div className="overflow-x-auto my-auto py-2">
          <table className="w-full text-left border-collapse text-sm">
            <caption className="sr-only">{title} data table</caption>
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Value ({unit})</th>
                <th className="py-2 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <td className="py-2 font-medium flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    {formatLabel(d.label)}
                  </td>
                  <td className="py-2 text-right font-mono">{d.value.toFixed(1)}</td>
                  <td className="py-2 text-right font-mono">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</td>
                </tr>
              ))}
              <tr className="font-bold text-zinc-950 dark:text-zinc-50">
                <td className="py-2">Total</td>
                <td className="py-2 text-right font-mono">{total.toFixed(1)}</td>
                <td className="py-2 text-right font-mono">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 my-auto">
          {total === 0 ? (
            <div className="h-40 flex items-center justify-center text-zinc-400 text-sm">
              No data logged yet
            </div>
          ) : (
            <>
              {/* SVG Donut */}
              <div className="relative w-40 h-40">
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full transform -rotate-90"
                  role="img"
                  aria-label={`${title} donut chart. ${dataDescription}`}
                >
                  <desc>A donut chart visualising emissions by category: ${dataDescription}</desc>
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#f4f4f5"
                    className="dark:stroke-zinc-800"
                    strokeWidth={strokeWidth}
                  />
                  {data.map((slice, index) => {
                    if (slice.value <= 0) return null;
                    const percent = slice.value / total;
                    const strokeDashoffset = circumference - (percent * circumference);
                    const strokeDasharray = circumference;
                    const rotation = (accumulatedPercent * 360);
                    accumulatedPercent += percent;

                    return (
                      <circle
                        key={index}
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(${rotation} 60 60)`}
                        className="transition-all duration-500 ease-out hover:opacity-95"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 font-mono">
                    {total.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
                    {unit} CO₂e
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-1.5 w-full md:w-auto">
                {data.map((d, i) => {
                  const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                  if (d.value === 0) return null;
                  return (
                    <div key={i} className="flex items-center justify-between md:justify-start gap-4 text-xs font-medium">
                      <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                        {formatLabel(d.label)}
                      </span>
                      <span className="font-mono text-zinc-500 dark:text-zinc-400">
                        {d.value.toFixed(1)} {unit} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// --- ACCESSIBLE BAR CHART ---
interface BarChartProps {
  data: ChartDataPoint[];
  title: string;
  unit?: string;
  maxValue?: number;
}

export const AccessibleBarChart: React.FC<BarChartProps> = ({ data, title, unit = 'kg', maxValue }) => {
  const [viewTable, setViewTable] = useState(false);
  const highestVal = maxValue || Math.max(...data.map(d => d.value), 10);

  const dataDescription = data
    .map(d => `${d.label}: ${d.value.toFixed(1)} ${unit}`)
    .join(', ');

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</h3>
        <Button
          variant="secondary"
          onClick={() => setViewTable(!viewTable)}
          ariaLabel={`Switch to ${viewTable ? 'chart' : 'table'} view for ${title}`}
          className="text-xs py-1 px-2.5"
        >
          {viewTable ? 'Show Chart' : 'Show Table'}
        </Button>
      </div>

      {viewTable ? (
        <div className="overflow-x-auto my-auto py-2">
          <table className="w-full text-left border-collapse text-sm">
            <caption className="sr-only">{title} data table</caption>
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Value ({unit})</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <td className="py-2 font-medium">{d.label}</td>
                  <td className="py-2 text-right font-mono">{d.value.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col gap-4 my-auto" role="img" aria-label={`${title} bar chart. ${dataDescription}`}>
          <desc>A bar chart visualising: ${dataDescription}</desc>
          {data.map((d, i) => {
            const pct = Math.min(100, Math.max(2, (d.value / highestVal) * 100));
            return (
              <div key={i} className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between font-semibold text-zinc-700 dark:text-zinc-300">
                  <span>{d.label}</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">
                    {d.value.toFixed(1)} {unit}
                  </span>
                </div>
                <div className="h-5 w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800 rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-all duration-500 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: d.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- ACCESSIBLE LINE CHART ---
interface LineChartProps {
  logs: LogEntry[];
  title: string;
  dataKey: 'total' | 'transportation' | 'electricity' | 'water' | 'food' | 'shopping';
  unit?: string;
  limit?: number;
}

export const AccessibleLineChart: React.FC<LineChartProps> = ({ logs, title, dataKey, unit = 'kg', limit = 7 }) => {
  const [viewTable, setViewTable] = useState(false);

  // Take the last N logs and reverse to display in chronological order
  const displayLogs = [...logs].slice(0, limit).reverse();
  const maxVal = Math.max(...displayLogs.map(l => l.emissions[dataKey]), 10);

  const dataDescription = displayLogs
    .map(l => `${l.date}: ${l.emissions[dataKey].toFixed(1)} ${unit}`)
    .join(', ');

  // SVG coordinates mapping
  const width = 500;
  const height = 150;
  const padding = 25;

  const getPoints = () => {
    if (displayLogs.length <= 1) return '';
    return displayLogs
      .map((log, idx) => {
        const x = padding + (idx / (displayLogs.length - 1)) * (width - 2 * padding);
        const y = height - padding - (log.emissions[dataKey] / maxVal) * (height - 2 * padding);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const getAreaPoints = () => {
    if (displayLogs.length <= 1) return '';
    const linePoints = getPoints();
    const startX = padding;
    const endX = width - padding;
    const baseY = height - padding;
    return `${startX},${baseY} ${linePoints} ${endX},${baseY}`;
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</h3>
        <Button
          variant="secondary"
          onClick={() => setViewTable(!viewTable)}
          ariaLabel={`Switch to ${viewTable ? 'chart' : 'table'} view for ${title}`}
          className="text-xs py-1 px-2.5"
        >
          {viewTable ? 'Show Chart' : 'Show Table'}
        </Button>
      </div>

      {viewTable ? (
        <div className="overflow-x-auto my-auto py-2">
          <table className="w-full text-left border-collapse text-sm">
            <caption className="sr-only">{title} data table</caption>
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="py-2">Date</th>
                <th className="py-2 text-right">Emissions ({unit})</th>
              </tr>
            </thead>
            <tbody>
              {displayLogs.map((l, i) => (
                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <td className="py-2 font-medium">{l.date}</td>
                  <td className="py-2 text-right font-mono">{l.emissions[dataKey].toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col gap-2 my-auto" role="img" aria-label={`${title} trend chart. ${dataDescription}`}>
          <desc>A line trend chart visualising: ${dataDescription}</desc>
          {displayLogs.length < 2 ? (
            <div className="h-32 flex items-center justify-center text-zinc-400 text-sm">
              Need at least 2 days of logs to render trend
            </div>
          ) : (
            <>
              {/* SVG Area Chart */}
              <div className="w-full">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e4e4e7" className="dark:stroke-zinc-800/40" strokeDasharray="3 3" />
                  <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e4e4e7" className="dark:stroke-zinc-800/40" strokeDasharray="3 3" />
                  <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e4e4e7" className="dark:stroke-zinc-800" />

                  {/* Shaded Area */}
                  <polygon
                    points={getAreaPoints()}
                    fill="url(#chartGradient)"
                    className="opacity-20 dark:opacity-15"
                  />

                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={getPoints()}
                  />

                  {/* Data Points */}
                  {displayLogs.map((log, idx) => {
                    const x = padding + (idx / (displayLogs.length - 1)) * (width - 2 * padding);
                    const y = height - padding - (log.emissions[dataKey] / maxVal) * (height - 2 * padding);
                    return (
                      <g key={idx} className="group/dot cursor-pointer">
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#3b82f6"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="dark:stroke-[#09090b] transition-all group-hover/dot:r-7"
                        />
                        <title>{`${log.date}: ${log.emissions[dataKey].toFixed(1)} ${unit}`}</title>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between px-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                <span>{displayLogs[0].date.split('-').slice(1).join('/')}</span>
                <span>{displayLogs[Math.floor(displayLogs.length / 2)].date.split('-').slice(1).join('/')}</span>
                <span>{displayLogs[displayLogs.length - 1].date.split('-').slice(1).join('/')}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
