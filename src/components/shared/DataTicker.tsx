import React from 'react';
import { useWorldStore } from '../../store/worldStore';

export default function DataTicker() {
  const markets = useWorldStore((s) => s.commodityMarkets);
  const globalEventLog = useWorldStore((s) => s.globalEventLog);

  // Take the last 15 events
  const recentEvents = globalEventLog.slice(0, 15);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-[#ff2244] font-bold drop-shadow-[0_0_3px_#ff2244]';
      case 'WARNING': return 'text-[#ffb300] font-semibold';
      case 'SYSTEM': return 'text-[#00e5ff]';
      default: return 'text-[#88ffaa]';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '⚡ [CRIT]';
      case 'WARNING': return '▲ [WARN]';
      case 'SYSTEM': return '⬡ [SYS]';
      default: return '◆ [INFO]';
    }
  };

  return (
    <div className="w-full bg-[#020502] border-y border-[#1a3a1a] h-7 flex items-center overflow-hidden text-[10px] font-mono tracking-wide select-none">
      {/* Ticker label */}
      <div className="live-indicator bg-[#1a4a1a] text-[#00ff44] px-3 h-full flex items-center font-bold shrink-0 uppercase border-r border-[#1a3a1a] z-10">
        LIVE FEED
      </div>

      {/* Scrolling Content Wrapper */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="ticker-container flex items-center gap-12 whitespace-nowrap overflow-visible">
          
          {/* Group of items (Doubled for seamless looping in CSS screen animation) */}
          {[1, 2].map((dupeGroupIndex) => (
            <div key={dupeGroupIndex} className="flex items-center gap-12 shrink-0">
              
              {/* Commodities list */}
              <div className="flex gap-6 text-[#00e5ff] shrink-0 border-r border-[#1a3a1a]/40 pr-6">
                {markets.map((m) => {
                  const hasShock = m.supplyShockActive;
                  const priceStr = `$${m.spotPriceUSD.toFixed(1)}`;
                  // Generate price trend indicator
                  const prevPrice = m.priceHistory[m.priceHistory.length - 2] || m.baselinePrice;
                  const wentUp = m.spotPriceUSD >= prevPrice;

                  return (
                    <span key={m.type} className="flex gap-1.5 items-center">
                      <span className="text-[#00cc33] font-bold uppercase">{m.type}:</span>
                      <span className={hasShock ? 'text-[#ff2244] font-bold animate-pulse' : 'text-white'}>
                        {priceStr}
                      </span>
                      <span className={wentUp ? 'text-[#00ff44]' : 'text-[#ff2244]'}>
                        {wentUp ? '▲' : '▼'}
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* Dynamic Global Events Crawler */}
              <div className="flex gap-8 items-center shrink-0">
                {recentEvents.length > 0 ? (
                  recentEvents.map((e, idx) => (
                    <span key={`${e.tick}-${idx}`} className={`flex gap-2 items-center ${getSeverityColor(e.severity)}`}>
                      <span className="text-gray-500 font-bold">T-{e.tick}</span>
                      <span>{getSeverityIcon(e.severity)}</span>
                      <span>{e.text.toUpperCase()}</span>
                      <span className="text-[#1a4a1a]">◆</span>
                    </span>
                  ))
                ) : (
                  <span className="text-[#00e5ff] tracking-widest uppercase">
                    NOMINAL COGNITIVE MATRIX // ALL SYSTEMS COMPLIANT // DEFCON MONITOR STATUS: GREEN
                  </span>
                )}
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
