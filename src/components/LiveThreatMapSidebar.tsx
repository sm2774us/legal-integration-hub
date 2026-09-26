import React, { useState } from 'react';
import { OfficeThreatNode, OfficeRegion, ThreatLevel } from '../types/threatMap';
import {
  Globe,
  Radio,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ExternalLink,
  RotateCcw,
  Zap,
  Filter,
  ChevronRight,
  Building2,
  Clock,
  Crosshair
} from 'lucide-react';

interface LiveThreatMapSidebarProps {
  offices: OfficeThreatNode[];
  selectedOfficeFilter: string | null;
  onSelectOfficeFilter: (officeName: string | null) => void;
  onSimulateThreatPing?: () => void;
  isCompact?: boolean;
  onToggleCompact?: () => void;
}

export const LiveThreatMapSidebar: React.FC<LiveThreatMapSidebarProps> = ({
  offices,
  selectedOfficeFilter,
  onSelectOfficeFilter,
  onSimulateThreatPing,
  isCompact = false,
  onToggleCompact
}) => {
  const [hoveredOffice, setHoveredOffice] = useState<OfficeThreatNode | null>(null);
  const [activeRegionTab, setActiveRegionTab] = useState<'ALL' | OfficeRegion>('ALL');

  // Summary telemetry calculations
  const totalViolations = offices.reduce((sum, o) => sum + o.metrics.totalViolations, 0);
  const totalCritical = offices.reduce((sum, o) => sum + o.metrics.criticalCount, 0);
  const totalWarning = offices.reduce((sum, o) => sum + o.metrics.warningCount, 0);
  const pulsingOfficesCount = offices.filter(o => o.hasActivePulse).length;

  const filteredOfficeList = offices
    .filter(o => activeRegionTab === 'ALL' || o.region === activeRegionTab)
    .sort((a, b) => {
      // Sort by critical count first, then warning, then total
      if (b.metrics.criticalCount !== a.metrics.criticalCount) {
        return b.metrics.criticalCount - a.metrics.criticalCount;
      }
      return b.metrics.totalViolations - a.metrics.totalViolations;
    });

  // World map paths (stylized continent silhouettes for high-tech vector representation)
  // Scaled for a 1000x500 SVG viewBox
  return (
    <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden shadow-xl flex flex-col font-mono">
      {/* Top Header */}
      <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <Globe className="w-4 h-4 text-sky-400" />
            {pulsingOfficesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Live Threat Map
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-rose-400" />
                <span>{pulsingOfficesCount} PULSING</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Global Office Network Risk Telemetry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onSimulateThreatPing && (
            <button
              onClick={onSimulateThreatPing}
              title="Trigger simulated multi-office threat ping"
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-800/70 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Simulate Ping</span>
            </button>
          )}

          {selectedOfficeFilter && (
            <button
              onClick={() => onSelectOfficeFilter(null)}
              title="Clear office geographical filter"
              className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 rounded text-[10px] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Clear Filter</span>
            </button>
          )}

          {onToggleCompact && (
            <button
              onClick={onToggleCompact}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ChevronRight
                className={`w-3.5 h-3.5 transform transition-transform ${
                  isCompact ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Global Risk Metrics Ribbon */}
      <div className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-900/40 text-[10px] text-center divide-x divide-slate-800/60">
        <div className="p-2">
          <span className="text-slate-500 block">TOTAL NODES</span>
          <span className="font-bold text-slate-200">{offices.length} Offices</span>
        </div>
        <div className="p-2">
          <span className="text-slate-500 block">CRITICAL</span>
          <span className={`font-bold ${totalCritical > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {totalCritical} Violations
          </span>
        </div>
        <div className="p-2">
          <span className="text-slate-500 block">WARNING</span>
          <span className={`font-bold ${totalWarning > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {totalWarning} Alerts
          </span>
        </div>
        <div className="p-2">
          <span className="text-slate-500 block">ENFORCEMENT</span>
          <span className="font-bold text-emerald-400">100% Blocked</span>
        </div>
      </div>

      {/* SVG Interactive World Threat Map Projection */}
      <div className="relative bg-[#070b14] border-b border-slate-800 p-2 overflow-hidden select-none">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Scanline radar sweep animation effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent pointer-events-none animate-pulse" />

        <svg
          viewBox="0 0 1000 500"
          className="w-full h-auto max-h-[300px] text-slate-700/60 relative z-10"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}
        >
          <defs>
            {/* Pulsing gradient for critical nodes */}
            <radialGradient id="pulseGradientCritical" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#e11d48" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#9f1239" stopOpacity="0" />
            </radialGradient>

            {/* Pulsing gradient for warning nodes */}
            <radialGradient id="pulseGradientWarning" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#d97706" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
            </radialGradient>

            {/* Pulsing gradient for nominal nodes */}
            <radialGradient id="pulseGradientNominal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* World Map Graticules (Latitude & Longitude grid lines) */}
          <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3">
            <line x1="0" y1="125" x2="1000" y2="125" />
            <line x1="0" y1="250" x2="1000" y2="250" />
            <line x1="0" y1="375" x2="1000" y2="375" />
            <line x1="250" y1="0" x2="250" y2="500" />
            <line x1="500" y1="0" x2="500" y2="500" />
            <line x1="750" y1="0" x2="750" y2="500" />
          </g>

          {/* Continent Outlines (Simplified High-Tech Polygon Shapes) */}
          {/* North America */}
          <path
            d="M 120 70 L 220 60 L 290 85 L 340 100 L 320 180 L 290 220 L 260 215 L 240 250 L 230 290 L 200 270 L 170 240 L 140 220 L 120 160 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.2"
          />
          {/* South America */}
          <path
            d="M 270 295 L 340 320 L 370 380 L 330 460 L 290 465 L 270 380 L 260 320 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.2"
          />
          {/* Europe */}
          <path
            d="M 460 80 L 540 85 L 560 140 L 530 190 L 470 200 L 440 170 L 450 120 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.2"
          />
          {/* United Kingdom */}
          <path
            d="M 465 130 L 485 125 L 480 155 L 460 150 Z"
            fill="#131e33"
            stroke="#334155"
            strokeWidth="1.2"
          />
          {/* Africa */}
          <path
            d="M 460 210 L 560 210 L 610 280 L 580 380 L 520 440 L 470 370 L 445 280 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.2"
          />
          {/* Asia */}
          <path
            d="M 570 80 L 780 70 L 890 120 L 880 200 L 800 270 L 740 260 L 690 320 L 630 250 L 570 190 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.2"
          />
          {/* Japan */}
          <path
            d="M 865 175 L 880 185 L 870 210 L 855 200 Z"
            fill="#131e33"
            stroke="#334155"
            strokeWidth="1.2"
          />
          {/* Australia */}
          <path
            d="M 760 360 L 870 350 L 880 430 L 780 440 L 750 400 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.2"
          />

          {/* Inter-Office Backbone Telemetry Lines (Curved Data Circuits) */}
          <g stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.25" fill="none">
            {/* New York to London */}
            <path d="M 295 185 Q 380 130 480 155" strokeDasharray="4 4" />
            {/* New York to Houston */}
            <path d="M 295 185 Q 265 200 235 217" strokeDasharray="3 3" />
            {/* London to Frankfurt */}
            <path d="M 480 155 Q 500 160 515 165" />
            {/* London to Singapore */}
            <path d="M 480 155 Q 630 220 775 280" strokeDasharray="5 5" />
            {/* Singapore to Tokyo */}
            <path d="M 775 280 Q 825 240 870 195" strokeDasharray="3 3" />
            {/* San Francisco to New York */}
            <path d="M 165 190 Q 230 170 295 185" strokeDasharray="3 3" />
            {/* San Francisco to Tokyo (Trans-Pacific Circuit) */}
            <path d="M 165 190 Q 90 120 0 140" strokeDasharray="3 3" />
            <path d="M 1000 140 Q 930 160 870 195" strokeDasharray="3 3" />
          </g>

          {/* Office Nodes Plotted with Concentric Pulse Animations */}
          {offices.map(office => {
            const posX = office.x * 10; // 0-100 mapped to 0-1000
            const posY = office.y * 5; // 0-100 mapped to 0-500
            const isHovered = hoveredOffice?.id === office.id;
            const isFiltered = selectedOfficeFilter === office.name;
            const hasPulse = office.hasActivePulse;
            const isCritical = office.pulseType === 'critical';
            const isWarning = office.pulseType === 'warning';

            return (
              <g
                key={office.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() =>
                  onSelectOfficeFilter(selectedOfficeFilter === office.name ? null : office.name)
                }
                onMouseEnter={() => setHoveredOffice(office)}
                onMouseLeave={() => setHoveredOffice(null)}
              >
                {/* Outer animated radar pulse ring when active */}
                {hasPulse && (
                  <>
                    <circle
                      cx={posX}
                      cy={posY}
                      r={isCritical ? 24 : 18}
                      fill={isCritical ? 'url(#pulseGradientCritical)' : 'url(#pulseGradientWarning)'}
                      className="animate-ping origin-center"
                      style={{ transformOrigin: `${posX}px ${posY}px` }}
                    />
                    <circle
                      cx={posX}
                      cy={posY}
                      r={isCritical ? 16 : 12}
                      stroke={isCritical ? '#f43f5e' : '#f59e0b'}
                      strokeWidth={1}
                      strokeOpacity={0.6}
                      fill="none"
                    />
                  </>
                )}

                {/* Filter highlight halo */}
                {isFiltered && (
                  <circle
                    cx={posX}
                    cy={posY}
                    r={20}
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    fill="none"
                  />
                )}

                {/* Core node dot */}
                <circle
                  cx={posX}
                  cy={posY}
                  r={isHovered ? 6 : isFiltered ? 5 : 4}
                  fill={
                    isCritical
                      ? '#f43f5e'
                      : isWarning
                      ? '#f59e0b'
                      : office.metrics.totalViolations > 0
                      ? '#38bdf8'
                      : '#10b981'
                  }
                  stroke={isFiltered ? '#38bdf8' : '#020617'}
                  strokeWidth={1.5}
                />

                {/* Office Name Label */}
                <text
                  x={posX}
                  y={posY - 9}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={isFiltered || hasPulse ? '700' : '500'}
                  fill={
                    isFiltered
                      ? '#38bdf8'
                      : isCritical
                      ? '#fda4af'
                      : isWarning
                      ? '#fde68a'
                      : '#cbd5e1'
                  }
                  style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {office.name}
                </text>

                {/* Violation Count Bubble if > 0 */}
                {office.metrics.totalViolations > 0 && (
                  <text
                    x={posX + 10}
                    y={posY + 4}
                    fontSize="8"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    fill={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#38bdf8'}
                  >
                    ({office.metrics.totalViolations})
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover / Selection Detail Floating Tooltip Box */}
        {(hoveredOffice || selectedOfficeFilter) && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 border border-slate-800 rounded-lg p-2.5 text-xs z-30 shadow-2xl backdrop-blur-sm animate-fadeIn">
            {(() => {
              const office =
                hoveredOffice ||
                offices.find(o => o.name === selectedOfficeFilter) ||
                offices[0];

              const isCritical = office.activeThreatLevel === 'CRITICAL';
              const isElevated = office.activeThreatLevel === 'ELEVATED';

              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-100">
                      <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{office.city}</span>
                      <span className="text-[10px] text-slate-400">({office.timeZone})</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : isElevated
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {office.activeThreatLevel} RISK
                      </span>

                      <button
                        onClick={() =>
                          onSelectOfficeFilter(
                            selectedOfficeFilter === office.name ? null : office.name
                          )
                        }
                        className={`px-2 py-0.5 rounded text-[9px] font-semibold cursor-pointer ${
                          selectedOfficeFilter === office.name
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {selectedOfficeFilter === office.name ? 'Clear Filter' : 'Filter Logs'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-sans">
                    <strong className="text-slate-300">Practice:</strong> {office.practiceFocus}
                  </p>

                  <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-800 text-[10px]">
                    <div className="bg-slate-950/70 p-1 rounded text-center">
                      <span className="text-slate-500 block text-[9px]">CRITICAL</span>
                      <strong className="text-rose-400">{office.metrics.criticalCount}</strong>
                    </div>
                    <div className="bg-slate-950/70 p-1 rounded text-center">
                      <span className="text-slate-500 block text-[9px]">WARNING</span>
                      <strong className="text-amber-400">{office.metrics.warningCount}</strong>
                    </div>
                    <div className="bg-slate-950/70 p-1 rounded text-center">
                      <span className="text-slate-500 block text-[9px]">INFO</span>
                      <strong className="text-sky-400">{office.metrics.infoCount}</strong>
                    </div>
                    <div className="bg-slate-950/70 p-1 rounded text-center">
                      <span className="text-slate-500 block text-[9px]">RESOLVED</span>
                      <strong className="text-emerald-400">{office.metrics.resolvedCount}</strong>
                    </div>
                  </div>

                  {office.lastIncident && (
                    <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-300 flex items-center justify-between">
                      <span className="truncate max-w-[200px] text-rose-300">
                        ⚡ {office.lastIncident.eventType}: {office.lastIncident.actorName}
                      </span>
                      <span className="text-slate-500 text-[9px]">
                        {new Date(office.lastIncident.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Region Filter Selector Tabs */}
      <div className="p-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
          <Crosshair className="w-3 h-3 text-amber-400" />
          <span>OFFICE THREAT RANKING:</span>
        </span>

        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
          {(['ALL', 'AMER', 'EMEA', 'APAC'] as const).map(region => (
            <button
              key={region}
              onClick={() => setActiveRegionTab(region)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeRegionTab === region
                  ? 'bg-slate-800 text-sky-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Office Nodes List */}
      <div className="divide-y divide-slate-800/60 max-h-[320px] overflow-y-auto">
        {filteredOfficeList.map(office => {
          const isSelected = selectedOfficeFilter === office.name;
          const isCritical = office.activeThreatLevel === 'CRITICAL';
          const isElevated = office.activeThreatLevel === 'ELEVATED';

          return (
            <div
              key={office.id}
              onClick={() =>
                onSelectOfficeFilter(selectedOfficeFilter === office.name ? null : office.name)
              }
              className={`p-2.5 transition-colors cursor-pointer text-xs flex items-center justify-between ${
                isSelected
                  ? 'bg-slate-800/80 border-l-2 border-sky-400'
                  : 'hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Status Dot / Pulse */}
                <div className="relative flex items-center justify-center shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCritical
                        ? 'bg-rose-500'
                        : isElevated
                        ? 'bg-amber-500'
                        : office.metrics.totalViolations > 0
                        ? 'bg-sky-400'
                        : 'bg-emerald-500'
                    }`}
                  />
                  {office.hasActivePulse && (
                    <span
                      className={`animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full opacity-75 ${
                        isCritical ? 'bg-rose-400' : 'bg-amber-400'
                      }`}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-200 truncate">{office.name}</span>
                    <span className="text-[10px] text-slate-500">[{office.region}]</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {office.practiceFocus}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-right">
                <div>
                  <div className="flex items-center justify-end gap-1.5 text-[10px]">
                    {office.metrics.criticalCount > 0 && (
                      <span className="text-rose-400 font-bold">
                        {office.metrics.criticalCount} Crit
                      </span>
                    )}
                    {office.metrics.warningCount > 0 && (
                      <span className="text-amber-400 font-semibold">
                        {office.metrics.warningCount} Warn
                      </span>
                    )}
                    {office.metrics.totalViolations === 0 && (
                      <span className="text-emerald-400 text-[10px]">Nominal</span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500">
                    {office.metrics.totalViolations} events logged
                  </span>
                </div>

                <div
                  className={`p-1 rounded text-[10px] ${
                    isSelected ? 'text-sky-400' : 'text-slate-600'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Click an office node to filter audit records</span>
        <span className="text-sky-400">MPLS / SD-WAN Active</span>
      </div>
    </div>
  );
};
