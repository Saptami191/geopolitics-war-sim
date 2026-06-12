import React, { useMemo } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { useClockStore } from '../../store/clockStore';

export default function DataTicker() {
  const markets = useWorldStore((s) => s.commodityMarkets);
  const globalEventLog = useWorldStore((s) => s.globalEventLog);
  const globalThreatLevel = useWorldStore((s) => s.globalThreatLevel);
  const currentTick = useWorldStore((s) => s.currentTick);

  // Take the most recent 12 events to show in the news feed
  const recentEvents = useMemo(() => {
    return globalEventLog.slice(0, 12);
  }, [globalEventLog]);

  // Translate raw system logs to high-impact external news reports
  const getBroadcastHeadline = (text: string, severity: string): string => {
    const t = text.toLowerCase();

    if (t.includes('orbital recon') || t.includes('satellite')) {
      return "ORBITAL UPDATE // constellation lock verified // satellite tracking target silos";
    }
    if (t.includes('signals command') || t.includes('covert op assigned')) {
      return "COVERT UPDATE // cyber intrusion squads deployed // signals intelligence scanners online";
    }
    if (t.includes('futures client locks') || t.includes('futures')) {
      return "FINANCIAL DESK // commodity futures indices locked in global portfolios // capital hedging active";
    }
    if (t.includes('short positions opened') || t.includes('short position')) {
      return "FINANCIAL WIRE // hedge short positions initiated to guard domestic liquidity reserves";
    }
    if (t.includes('strict trade embargo') || t.includes('embargo') || t.includes('sanctions:')) {
      return "BREAKING // unilateral sanctions decree deployed // shipping blockades and border assets freeze in effect";
    }
    if (t.includes('eases sanctions')) {
      return "INTERNATIONAL DIPLOMACY // sanctions relief authorized // merchant tankers cleared to resume commerce corridors";
    }
    if (t.includes('technology upgrade') || t.includes('researchers deployed')) {
      return "ADVANCED PROJECTS // sovereign science milestones ratify major technological blueprint upgrades";
    }
    if (t.includes('fiscal command') || t.includes('budget plan approved')) {
      return "BUDGET ALLOCATIONS // state capital re-balancing completed by ministerial cabinet decree";
    }
    if (t.includes('martial law') || t.includes('federal martial decree')) {
      return "SECURITY EMERGENCY // federal martial law enforced // civil lockdown active over sovereign sectors";
    }
    if (t.includes('expels') || t.includes('oligarch')) {
      return "CRISIS REPORT // state police units freeze illegal oligarch properties & Purge offshore credit reserves";
    }
    if (t.includes('cabinet reshuffle') || t.includes('new appointee')) {
      return "CABINET BULLETIN // supreme administration concludes major restructure // ministers assume portfolios";
    }
    if (t.includes('policy rate adjusted') || t.includes('interest rate')) {
      return "MARKET WATCH // benchmark policy interest rate updated to curb baseline inflation metrics";
    }
    if (t.includes('bond desk') || t.includes('sovereign treasury bills')) {
      return "BOND DESK // sovereign treasury bill auctions closed // liquidity volume injected to reserve accounts";
    }
    if (t.includes('default protocol') || t.includes('defaults on sovereign')) {
      return "MARKET SHOCK // sovereign debt default triggered // global rating agencies downgrade bond indexes to junk";
    }
    if (t.includes('black market') || t.includes('ordnance')) {
      return "COVERT CARGO // black-market military shipments logged and delivered to tactical warehouses";
    }
    if (t.includes('war clerk') && t.includes('fired') || t.includes('launch order authorized')) {
      return "MILITARY REPORT // tactical ordnance launched // ballistic trajectories hot // warheads locked on targets";
    }
    if (t.includes('propellant') && t.includes('charge')) {
      return "READY STATUS // silo propellant reload complete // silo pressure buffers locked at maximum launch standby";
    }
    if (t.includes('direct aid') || t.includes('direct economic aid')) {
      return "DIPLOMACY WIRE // allied direct aid credit cleared // trade alliance development scores upgraded";
    }
    if (t.includes('blockade decree') || t.includes('full unilateral sanctions')) {
      return "EMBARGO DIRECTIVE // aggregate shipping blockades validated // trade manifest registers locked down";
    }
    if (t.includes('treaty ratified') || t.includes('signed mutual defense') || t.includes('treaty signed')) {
      return "ALLIANCE RATIFIED // mutual defense treaties sealed // military commands align joint threat warning networks";
    }
    if (t.includes('drone command') || t.includes('launched kinetic paystrike')) {
      return "KINETIC UPDATE // armed drone kinetic strike completed // hostile command post footprints deleted";
    }
    if (t.includes('target locked') || t.includes('strike target')) {
      return "COORDINATES LOCKED // aerospace orbital target parameters set inside defense batteries";
    }
    if (t.includes('tactical warning') || t.includes('ballistic target trace') || t.includes(' airspace!')) {
      return "AEROSPACE ALERT // ballistic tracking systems trace warning signatures // air intercept arrays hot";
    }
    if (t.includes('covert operational network') || t.includes('signals scanning')) {
      return "SIGNAL INTERCEPT // intelligence decrypt operations decode diplomatic chatter in target embassy";
    }
    if (t.includes('printing press') || t.includes('currency press active')) {
      return "MONETARY ADJUSTMENT // central bank printing press initialized // capital reserves expanded";
    }
    if (t.includes('scenario accomplished') || t.includes('win')) {
      return "SIMULATION OVER // sovereign campaign objectives achieved // global order stabilized";
    }
    if (t.includes('scenario fiasco') || t.includes('loss')) {
      return "SIMULATION OVER // supreme government collapsed // operations terminated under major defaults";
    }

    // Default stylized status reports if log is generic or quiet
    if (severity === 'CRITICAL') {
      return `BREAKING NEWS // ALERT DIRECTIVE // ${text.toUpperCase()}`;
    }
    if (severity === 'WARNING') {
      return `WARNING // INTEL OVERVIEW // ${text.toUpperCase()}`;
    }
    return `NEWS REPORT // STATE UPDATE // ${text.toUpperCase()}`;
  };

  // Status defaults for starter matrix
  const fallbackHeadlines = [
    "SITUATION ROOM REPORT // surveillance constellation online // multi-spectrum early warning active",
    "GLOBAL ALIGNMENT // diplomatic delegations report elevated border maneuvers in neutral territories",
    "RECON PROTOCOLS // aerospace satellites tracking missile silos and naval coordinates",
    "DEFCON STATUS // early warning radar monitors stand ready across all defensive sectors"
  ];

  // Assemble full tape contents
  const newsTickerTape = useMemo(() => {
    if (recentEvents.length === 0) return fallbackHeadlines;
    return recentEvents.map((e) => getBroadcastHeadline(e.text, e.severity));
  }, [recentEvents]);

  // Is there an active threat scenario (RED status default alert)
  const isRedThreat = globalThreatLevel === 'RED' || globalThreatLevel === 'ORANGE';

  return (
    <div className="w-full bg-[#020502] border-y border-[#1a3a1a] h-7 flex items-center overflow-hidden text-[9px] font-mono tracking-wider select-none z-30">
      {/* Ticker label */}
      <div className={`live-indicator px-3 h-full flex items-center font-bold shrink-0 uppercase border-r border-[#1a3a1a] z-10 select-none ${
        isRedThreat
          ? 'bg-red-950 text-red-500 font-extrabold animate-pulse'
          : 'bg-[#0f2c0f] text-[#00ff44]'
      }`}>
        {isRedThreat ? '☢ BREAKING NEWS' : '⚡ LIVE WIRE'}
      </div>

      {/* Scrolling Content Wrapper */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="flex animate-[customTicker_35s_linear_infinite] hover:animation-play-state:paused whitespace-nowrap gap-12 shrink-0">
          
          {/* Loop Group 1 */}
          <div className="flex items-center gap-12 shrink-0">
            {/* Commodity Indexes */}
            <div className="flex gap-5 text-[#00e5ff] shrink-0 border-r border-[#1a3a1a]/40 pr-6">
              {markets.map((m) => {
                const hasShock = m.supplyShockActive;
                const priceStr = `$${m.spotPriceUSD.toFixed(1)}`;
                const prevPrice = m.priceHistory[m.priceHistory.length - 2] || m.baselinePrice;
                const wentUp = m.spotPriceUSD >= prevPrice;

                return (
                  <span key={`group1-${m.type}`} className="flex gap-1.5 items-center">
                    <span className="text-[#00cc33] font-bold uppercase">{m.type}:</span>
                    <span className={hasShock ? 'text-[#ff2244] font-black animate-pulse' : 'text-white'}>
                      {priceStr}
                    </span>
                    <span className={wentUp ? 'text-[#00ff44]' : 'text-[#ff2244]'}>
                      {wentUp ? '▲' : '▼'}
                    </span>
                  </span>
                );
              })}
            </div>

            {/* Compiled Event Headlines list */}
            {newsTickerTape.map((head, idx) => (
              <span key={`head1-${idx}`} className={`flex gap-2 items-center ${
                head.startsWith('BREAKING') || head.includes('ALERT') 
                  ? 'text-[#ff2244] font-extrabold drop-shadow-[0_0_3px_#ff2244]' 
                  : head.startsWith('WARNING') 
                  ? 'text-amber-400 font-bold' 
                  : 'text-gray-300'
              }`}>
                <span className="text-gray-500 font-black">⚙</span>
                <span>{head.toUpperCase()}</span>
                <span className="text-[#1a4a1a]">◆</span>
              </span>
            ))}
          </div>

          {/* Loop Group 2 for seamless scrolling */}
          <div className="flex items-center gap-12 shrink-0">
            {/* Commodity Indexes duplicate */}
            <div className="flex gap-5 text-[#00e5ff] shrink-0 border-r border-[#1a3a1a]/40 pr-6">
              {markets.map((m) => {
                const hasShock = m.supplyShockActive;
                const priceStr = `$${m.spotPriceUSD.toFixed(1)}`;
                const prevPrice = m.priceHistory[m.priceHistory.length - 2] || m.baselinePrice;
                const wentUp = m.spotPriceUSD >= prevPrice;

                return (
                  <span key={`group2-${m.type}`} className="flex gap-1.5 items-center">
                    <span className="text-[#00cc33] font-bold uppercase">{m.type}:</span>
                    <span className={hasShock ? 'text-[#ff2244] font-black animate-pulse' : 'text-white'}>
                      {priceStr}
                    </span>
                    <span className={wentUp ? 'text-[#00ff44]' : 'text-[#ff2244]'}>
                      {wentUp ? '▲' : '▼'}
                    </span>
                  </span>
                );
              })}
            </div>

            {/* Compiled Event Headlines duplicate */}
            {newsTickerTape.map((head, idx) => (
              <span key={`head2-${idx}`} className={`flex gap-2 items-center ${
                head.startsWith('BREAKING') || head.includes('ALERT') 
                  ? 'text-[#ff2244] font-extrabold drop-shadow-[0_0_3px_#ff2244]' 
                  : head.startsWith('WARNING') 
                  ? 'text-amber-400 font-bold' 
                  : 'text-gray-300'
              }`}>
                <span className="text-gray-500 font-black">⚙</span>
                <span>{head.toUpperCase()}</span>
                <span className="text-[#1a4a1a]">◆</span>
              </span>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes customTicker {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
