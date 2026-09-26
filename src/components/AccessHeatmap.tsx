import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { AccessHeatmapCell, generateAccessHeatmapData } from '../data/heatmapData';
import {
  Flame,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Info,
  Layers,
  Sparkles,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface AccessHeatmapProps {
  onSelectCell?: (cell: AccessHeatmapCell) => void;
}

export const AccessHeatmap: React.FC<AccessHeatmapProps> = ({ onSelectCell }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [heatmapData] = useState<AccessHeatmapCell[]>(() => generateAccessHeatmapData());
  const [selectedCell, setSelectedCell] = useState<AccessHeatmapCell | null>(null);
  const [viewMode, setViewMode] = useState<'ALL' | 'CRITICAL' | 'OFF_HOURS'>('ALL');
  const [highlightAnomalies, setHighlightAnomalies] = useState<boolean>(true);

  // Tooltip state for smooth hover
  const [hoverInfo, setHoverInfo] = useState<{
    visible: boolean;
    x: number;
    y: number;
    cell: AccessHeatmapCell | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    cell: null
  });

  // Filtered data based on view mode
  const filteredData = useMemo(() => {
    return heatmapData.map(cell => {
      let count = cell.accessCount;
      if (viewMode === 'CRITICAL') {
        count = cell.criticalCount;
      } else if (viewMode === 'OFF_HOURS') {
        const isOffHours = cell.hour < 7 || cell.hour >= 20;
        count = isOffHours ? cell.accessCount : 0;
      }
      return {
        ...cell,
        displayCount: count
      };
    });
  }, [heatmapData, viewMode]);

  // Detected anomalies list for auditors
  const detectedAnomalies = useMemo(() => {
    return heatmapData.filter(c => c.isAnomaly);
  }, [heatmapData]);

  // Set default selected cell to the most critical anomaly (Tuesday 02:00)
  useEffect(() => {
    if (!selectedCell) {
      const topAnomaly = heatmapData.find(c => c.dayIndex === 1 && c.hour === 2) || heatmapData[0];
      setSelectedCell(topAnomaly);
      if (onSelectCell) onSelectCell(topAnomaly);
    }
  }, [heatmapData, onSelectCell, selectedCell]);

  // Render Heatmap with D3.js
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 32, right: 30, bottom: 25, left: 48 };
    const width = 860;
    const height = 230;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = d3.range(0, 24);

    // Scales
    const xScale = d3.scaleBand<number>()
      .domain(hours)
      .range([0, innerWidth])
      .padding(0.08);

    const yScale = d3.scaleBand<string>()
      .domain(days)
      .range([0, innerHeight])
      .padding(0.12);

    // Calculate max value for color scale
    const maxVal = d3.max(filteredData, d => d.displayCount) || 50;

    // Custom dark theme color scale: deep slate-900 -> indigo-900 -> sky-600 -> amber-500 -> rose-500
    const colorScale = d3.scaleLinear<string>()
      .domain([0, Math.max(1, maxVal * 0.15), maxVal * 0.45, maxVal * 0.75, maxVal])
      .range(['#0f172a', '#1e293b', '#0284c7', '#f59e0b', '#f43f5e']);

    // Draw X-axis (Hours)
    const xAxisGroup = g.append('g')
      .attr('transform', `translate(0, -6)`)
      .call(
        d3.axisTop(xScale)
          .tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22])
          .tickFormat(d => `${d.toString().padStart(2, '0')}:00`)
      );

    xAxisGroup.select('.domain').remove();
    xAxisGroup.selectAll('.tick line').remove();
    xAxisGroup.selectAll('.tick text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9.5px')
      .attr('font-family', 'JetBrains Mono, monospace');

    // Draw Y-axis (Days)
    const yAxisGroup = g.append('g')
      .call(d3.axisLeft(yScale));

    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('.tick line').remove();
    yAxisGroup.selectAll('.tick text')
      .attr('fill', '#cbd5e1')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('font-family', 'JetBrains Mono, monospace');

    // Business Hours Shading Background Bracket (08:00 - 18:00)
    const startX = xScale(8) || 0;
    const endX = (xScale(18) || 0) + xScale.bandwidth();
    g.append('rect')
      .attr('x', startX)
      .attr('y', -18)
      .attr('width', endX - startX)
      .attr('height', innerHeight + 18)
      .attr('fill', 'rgba(56, 189, 248, 0.03)')
      .attr('stroke', 'rgba(56, 189, 248, 0.15)')
      .attr('stroke-dasharray', '3 3')
      .attr('rx', 4)
      .lower();

    // Label for business hours
    g.append('text')
      .attr('x', startX + (endX - startX) / 2)
      .attr('y', -19)
      .attr('text-anchor', 'middle')
      .attr('fill', '#38bdf8')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('opacity', 0.8)
      .text('FIRM BUSINESS HOURS (08:00 - 18:00)');

    // Render Heatmap Cells
    const cellGroups = g.selectAll('.heatmap-cell-group')
      .data(filteredData)
      .enter()
      .append('g')
      .attr('class', 'heatmap-cell-group')
      .attr('transform', d => `translate(${xScale(d.hour)}, ${yScale(d.dayName)})`);

    // Rectangles
    cellGroups.append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', d => {
        if (d.displayCount === 0) return '#090d16';
        return colorScale(d.displayCount);
      })
      .attr('stroke', d => {
        if (selectedCell?.dayIndex === d.dayIndex && selectedCell?.hour === d.hour) {
          return '#38bdf8'; // Selected highlight
        }
        if (highlightAnomalies && d.isAnomaly) {
          return '#f43f5e'; // Anomaly border
        }
        return 'rgba(255,255,255,0.06)';
      })
      .attr('stroke-width', d => {
        if (selectedCell?.dayIndex === d.dayIndex && selectedCell?.hour === d.hour) return 2;
        if (highlightAnomalies && d.isAnomaly) return 1.5;
        return 0.5;
      })
      .attr('cursor', 'pointer')
      .style('transition', 'all 0.15s ease')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#fbbf24')
          .attr('stroke-width', 2);

        const [containerX, containerY] = d3.pointer(event, containerRef.current);
        setHoverInfo({
          visible: true,
          x: containerX,
          y: containerY,
          cell: d
        });
      })
      .on('mousemove', function(event, d) {
        const [containerX, containerY] = d3.pointer(event, containerRef.current);
        setHoverInfo(prev => ({
          ...prev,
          x: containerX,
          y: containerY,
          cell: d
        }));
      })
      .on('mouseout', function(event, d) {
        const isSel = selectedCell?.dayIndex === d.dayIndex && selectedCell?.hour === d.hour;
        const isAnom = highlightAnomalies && d.isAnomaly;
        d3.select(this)
          .attr('stroke', isSel ? '#38bdf8' : isAnom ? '#f43f5e' : 'rgba(255,255,255,0.06)')
          .attr('stroke-width', isSel ? 2 : isAnom ? 1.5 : 0.5);

        setHoverInfo(prev => ({ ...prev, visible: false }));
      })
      .on('click', function(event, d) {
        setSelectedCell(d);
        if (onSelectCell) onSelectCell(d);
      });

    // Add pulse markers on anomalies
    if (highlightAnomalies) {
      const anomalies = cellGroups.filter(d => d.isAnomaly);

      // Warning marker diamond or dot in cell center
      anomalies.append('circle')
        .attr('cx', xScale.bandwidth() / 2)
        .attr('cy', yScale.bandwidth() / 2)
        .attr('r', 2.8)
        .attr('fill', d => d.criticalCount > 5 ? '#f43f5e' : '#fbbf24')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.8)
        .attr('pointer-events', 'none');
    }

  }, [filteredData, selectedCell, highlightAnomalies, onSelectCell]);

  return (
    <div className="border border-amber-500/30 bg-slate-900/80 rounded-xl p-5 md:p-6 space-y-5 shadow-lg">
      {/* Top Header & Tool Ribbon */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold font-mono text-amber-300 uppercase tracking-wide">
              Sensitive Data Access Heatmap // D3.js Temporal Hotspots
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Audit Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Visualizes frequency and density of restricted matter access across 24 hours of each day. Identifies anomalous off-hours exfiltration attempts and ethical wall stress points.
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap text-xs font-mono">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] px-2">FILTER:</span>
            <button
              onClick={() => setViewMode('ALL')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Access
            </button>
            <button
              onClick={() => setViewMode('CRITICAL')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Critical Breaches
            </button>
            <button
              onClick={() => setViewMode('OFF_HOURS')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'OFF_HOURS'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Off-Hours Only
            </button>
          </div>

          <button
            onClick={() => setHighlightAnomalies(!highlightAnomalies)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              highlightAnomalies
                ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${highlightAnomalies ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>Highlight Anomalies ({detectedAnomalies.length})</span>
          </button>
        </div>
      </div>

      {/* D3 Heatmap SVG Container with Tooltip Overlay */}
      <div ref={containerRef} className="relative w-full bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 overflow-x-auto">
        <svg ref={svgRef} className="w-full min-w-[760px] h-auto overflow-visible select-none" />

        {/* Hover Tooltip */}
        {hoverInfo.visible && hoverInfo.cell && (
          <div
            className="absolute pointer-events-none z-50 bg-slate-900 border border-amber-500/60 p-3 rounded-lg shadow-2xl text-xs font-mono max-w-xs transition-transform transform -translate-x-1/2 -translate-y-full -mt-2"
            style={{ left: hoverInfo.x, top: hoverInfo.y }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-slate-200 font-bold">
              <span>{hoverInfo.cell.dayName} at {hoverInfo.cell.hourLabel}</span>
              <span className="text-amber-400">{hoverInfo.cell.displayCount ?? hoverInfo.cell.accessCount} events</span>
            </div>

            <div className="space-y-1 py-1.5 text-[11px]">
              <div className="flex justify-between text-rose-400">
                <span>Critical Wall Breaches:</span>
                <strong>{hoverInfo.cell.criticalCount}</strong>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Warning DLP Blocks:</span>
                <strong>{hoverInfo.cell.warningCount}</strong>
              </div>
              <div className="flex justify-between text-sky-400">
                <span>Routine / Label Actions:</span>
                <strong>{hoverInfo.cell.infoCount}</strong>
              </div>
              <div className="text-slate-400 truncate pt-1 border-t border-slate-800/60">
                Matter: <span className="text-slate-300">{hoverInfo.cell.topMatterNumber}</span>
              </div>
              <div className="text-slate-400 truncate">
                Actor: <span className="text-slate-300">{hoverInfo.cell.topActor}</span>
              </div>
            </div>

            {hoverInfo.cell.isAnomaly && (
              <div className="mt-1.5 p-1.5 rounded bg-rose-950/80 border border-rose-800 text-rose-200 text-[10px] leading-tight">
                ⚠️ {hoverInfo.cell.anomalyDescription}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Heatmap Legend & Anomaly Highlights Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs font-mono pt-1">
        {/* Color Ramp Legend */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">ACCESS FREQUENCY:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500">Low (0-5)</span>
            <div className="flex h-3 w-36 rounded overflow-hidden border border-slate-800">
              <div className="w-1/5 bg-[#0f172a]" />
              <div className="w-1/5 bg-[#1e293b]" />
              <div className="w-1/5 bg-[#0284c7]" />
              <div className="w-1/5 bg-[#f59e0b]" />
              <div className="w-1/5 bg-[#f43f5e]" />
            </div>
            <span className="text-[10px] text-rose-400 font-bold">Surge (60+)</span>
          </div>
        </div>

        {/* Legend item for Anomaly Dots */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white inline-block" />
            <span>Anomalous Spikes Flagged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-sky-400/40 bg-sky-500/10 inline-block" />
            <span>08:00 - 18:00 Standard Work Hours</span>
          </div>
        </div>
      </div>

      {/* Auditor Deep-Dive Callout on Selected Cell */}
      {selectedCell && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-slate-200 font-bold">
                AUDITOR INSPECTION WINDOW: {selectedCell.dayName} at {selectedCell.hourLabel} (60 min slice)
              </span>
              {selectedCell.isAnomaly ? (
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                  UNUSUAL TRAFFIC PATTERN DETECTED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                  Within Baseline Variance
                </span>
              )}
            </div>

            <span className="text-slate-400 text-[11px]">
              Total Volume: <strong className="text-amber-300">{selectedCell.accessCount} requests</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Severity Distribution:</span>
              <div className="flex items-center justify-between text-rose-400">
                <span>Critical Breaches:</span>
                <strong>{selectedCell.criticalCount}</strong>
              </div>
              <div className="flex items-center justify-between text-amber-400">
                <span>Warning DLP Blocks:</span>
                <strong>{selectedCell.warningCount}</strong>
              </div>
              <div className="flex items-center justify-between text-sky-400">
                <span>Routine Reads:</span>
                <strong>{selectedCell.infoCount}</strong>
              </div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Target Matter Workspace:</span>
              <div className="font-bold text-amber-300">{selectedCell.topMatterNumber}</div>
              <div className="text-slate-300 text-[11px] line-clamp-2">{selectedCell.topMatter}</div>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] block">Primary Principal & Activity:</span>
              <div className="font-bold text-slate-200">{selectedCell.topActor}</div>
              <div className="text-[11px] text-slate-400">
                {selectedCell.isAnomaly 
                  ? 'Off-hours API session with high volume of document metadata queries.'
                  : 'Standard interactive session via iManage Work 10 web extension.'}
              </div>
            </div>
          </div>

          {selectedCell.anomalyDescription && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-rose-200 text-xs flex items-start gap-2.5 font-sans">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-mono text-rose-300 block mb-0.5">COMPLIANCE ADVISORY FINDING:</strong>
                {selectedCell.anomalyDescription}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
