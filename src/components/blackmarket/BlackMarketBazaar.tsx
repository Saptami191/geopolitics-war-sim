import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { useBlackMarketStore } from '../../store/blackMarketStore';
import { audio } from '../../utils/audio';
import AnimatedValue from '../shared/AnimatedValue';

interface BlackMarketBazaarProps {
  onClose: () => void;
}

export default function BlackMarketBazaar({ onClose }: BlackMarketBazaarProps) {
  const currentTick = useWorldStore((s) => s.currentTick);
  const playerCountryId = usePlayerStore((s) => s.countryId);
  const cashB = usePlayerStore((s) => s.cashB);
  
  const suspicion = useBlackMarketStore((s) => s.internationalSuspicion);
  const activeLots = useBlackMarketStore((s) => s.activeLots);
  const pendingDeliveries = useBlackMarketStore((s) => s.pendingDeliveries);
  const placePlayerBid = useBlackMarketStore((s) => s.placePlayerBid);
  const pushTerminalLine = useUIStore((s) => s.pushTerminalLine);
  
  // Local input bid states
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});
  const [errorMsgs, setErrorMsgs] = useState<Record<string, string>>({});
  
  // Visual reaction/flash systems
  const [lastUpdatedLots, setLastUpdatedLots] = useState<Record<string, 'player' | 'ai'>>({});
  const [hackerChatter, setHackerChatter] = useState<string[]>([
    "SECURE_LINE: Decrypted routing handshake successful.",
    "BROKER_NET: 4 active lots verified for tender.",
    "SYSTEM_ALERT: Satellite shielding coverage at 94%."
  ]);

  // Curated booster rumors for upcoming pipeline
  const incomingRumors = [
    {
      id: 'RUM-1',
      type: 'NUCLEAR_TRIGGERS',
      title: 'Krytron Switch Assemblies',
      broker: '[OMEGA_NUCLEONICS]',
      chatter: 'Intercept logs confirm critical heavy-grade trigger circuits are preparing for Baltic transit. Direct high-value listing scheduled for prompt release.',
      eta: '5 Ticks'
    },
    {
      id: 'RUM-2',
      type: 'SATELLITE_JAMMERS',
      title: 'Orbit Wave Array Platform',
      broker: '[AERODYNE_CYBER]',
      chatter: 'Logistics leak suggests direct-wave electronic jamming arrays scheduled to bypass coastal radar monitors next cycle.',
      eta: '3 Ticks'
    },
    {
      id: 'RUM-3',
      type: 'CRUISE_MISSILE',
      title: 'Subsonic Land-Attack Missiles',
      broker: '[SABRE_GROUP]',
      chatter: 'Balkan supply depot diversion confirmed. Stockpile of 30 guided tactical cruise units to be registered briefly.',
      eta: '1 Tick'
    }
  ];

  // Run initial bootstrap on mount to ensure we never open empty
  useEffect(() => {
    useBlackMarketStore.getState().bootstrapStarterLots(currentTick);
  }, [currentTick]);

  // Slow chatter updating timer
  useEffect(() => {
    const handleChatterRandom = () => {
      const phrases = [
        "NET_LOG: Anonymous transaction registered on Russian maritime pipeline.",
        "INTELLIGENCE: Port security sweep scheduled in Northern Sea corridor.",
        "SELLER_DIRECTIVE: Escrow locked for bidding. Intermediary secure.",
        "WARNING: Sub-aquatic signal traces detected near tactical assets.",
        "RUMOR: [RED_ORION] acquiring massive bulk transport logistics."
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setHackerChatter(prev => [randomPhrase, ...prev.slice(0, 5)]);
    };

    const interval = setInterval(handleChatterRandom, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleBidSubmit = (lotId: string) => {
    setErrorMsgs((prev) => ({ ...prev, [lotId]: '' }));
    audio.sfxKeyClick();

    const valueStr = bidInputs[lotId];
    if (!valueStr) {
      setErrorMsgs((prev) => ({ ...prev, [lotId]: 'Enter a target bid amount.' }));
      return;
    }

    const amount = parseFloat(valueStr);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsgs((prev) => ({ ...prev, [lotId]: 'Enter a valid positive number.' }));
      return;
    }

    const res = placePlayerBid(lotId, amount);
    if (!res.success) {
      setErrorMsgs((prev) => ({ ...prev, [lotId]: res.error || 'Invalid bid.' }));
      useUIStore.getState().pushAlert({
        title: 'BID DENIED',
        message: res.error || 'Bid rejected.',
        type: 'DANGER'
      });
      return;
    }

    // Bid succeeded! Clear input
    setBidInputs((prev) => ({ ...prev, [lotId]: '' }));
    setLastUpdatedLots(prev => ({ ...prev, [lotId]: 'player' }));
    
    useUIStore.getState().pushAlert({
      title: 'COVERT BID PLACED',
      message: `Successfully registered bid of $${amount.toFixed(2)}B on Lot ${lotId}. Direct signal secure.`,
      type: 'INFO'
    });
    pushTerminalLine(`BLACK MARKET: Placed high bid of $${amount.toFixed(2)}B on Lot ${lotId}.`, 'INFO');

    // Trigger AI Counter Bid within a short simulated delay window (800ms - 1500ms)
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      setLastUpdatedLots(prev => ({ ...prev, [lotId]: 'ai' }));
      useBlackMarketStore.getState().runSingleAICounterBid(lotId);
      
      // Let temporary flash clear after 1.5 seconds
      setTimeout(() => {
        setLastUpdatedLots(prev => {
          const next = { ...prev };
          delete next[lotId];
          return next;
        });
      }, 1500);
    }, delay);
  };

  const handleQuickRaise = (lotId: string, currentBid: number, percent: number) => {
    const raiseAmount = parseFloat((currentBid * (1 + percent)).toFixed(2));
    const res = placePlayerBid(lotId, raiseAmount);
    if (!res.success) {
      setErrorMsgs((prev) => ({ ...prev, [lotId]: res.error || 'Invalid raise.' }));
      useUIStore.getState().pushAlert({
        title: 'BID DENIED',
        message: res.error || 'Raise rejected.',
        type: 'DANGER'
      });
      return;
    }

    // Clear previous error
    setErrorMsgs((prev) => ({ ...prev, [lotId]: '' }));
    setLastUpdatedLots(prev => ({ ...prev, [lotId]: 'player' }));

    useUIStore.getState().pushAlert({
      title: 'QUICK BID SUCCESSFUL',
      message: `Covertly raised bid to $${raiseAmount.toFixed(2)}B (+${Math.round(percent * 100)}%).`,
      type: 'INFO'
    });
    pushTerminalLine(`BLACK MARKET: Covertly raised bid to $${raiseAmount.toFixed(2)}B on Lot ${lotId}.`, 'INFO');

    // Trigger AI Counter Bid within a short simulated delay window (800ms - 1500ms)
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      setLastUpdatedLots(prev => ({ ...prev, [lotId]: 'ai' }));
      useBlackMarketStore.getState().runSingleAICounterBid(lotId);
      
      // Let temporary flash clear after 1.5 seconds
      setTimeout(() => {
        setLastUpdatedLots(prev => {
          const next = { ...prev };
          delete next[lotId];
          return next;
        });
      }, 1500);
    }, delay);
  };

  // Divide lots into active live auctions and other states
  const liveLots = activeLots.filter(l => l.status === 'LIVE');

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto p-4 md:p-8 flex flex-col font-mono text-[#00ff44] select-none">
      
      {/* Decorative scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-15" />
      
      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 relative z-10 space-y-6">
        
        {/* HEADER BLOCK */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1a5c1a] pb-4 mb-2 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-black text-shadow tracking-widest text-[#00ff44] animate-pulse">
                ☠️ COVERT ARMS BLACK MARKET
              </span>
              <span className="bg-red-950 text-red-500 border border-red-800 text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest animate-pulse">
                CLANDESTINE BAZAAR ACTIVE
              </span>
            </div>
            <span className="text-[10px] text-gray-500 uppercase mt-1 tracking-widest">
              Sovereign procurement network • Anonymous buyers matrix • Satellite orbital intercept routing
            </span>
          </div>

          <button
            onClick={() => { audio.sfxKeyClick(); onClose(); }}
            className="px-4 py-2 border border-[#1a5c1a] hover:border-red-500 hover:text-red-500 rounded bg-[#030703]/80 text-[10px] cursor-pointer transition-all uppercase tracking-widest font-bold"
          >
            [RETURN TO COMMAND HUB - ESC]
          </button>
        </div>

        {/* TOP STATUS GAUGES PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#020502]/90 border border-[#1a5c1a]/50 p-4 rounded-md">
          
          {/* LIQUIDITY RESOURCING */}
          <div className="lg:col-span-3 flex flex-col justify-center border-r border-[#1a5c1a]/30 pr-4">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider">AVAILABLE TREASURY RES:</span>
            <div className="text-white text-2xl font-black tracking-widest mt-1">
              $<AnimatedValue target={cashB} formatter={(v) => v.toFixed(1)} />B
            </div>
            <span className="text-[9px] text-emerald-600 uppercase mt-0.5">UN-AUDITED OFFSHORE LIQUID RESERVE</span>
          </div>

          {/* SMUGGLING EXPOSURE RISK METER */}
          <div className="lg:col-span-5 flex flex-col justify-center px-2">
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-gray-500 uppercase tracking-wider">SMUGGLING SUSPICION COEFFICIENT:</span>
              <span className={`font-bold tracking-widest ${suspicion > 80 ? 'text-red-500 animate-pulse' : suspicion > 60 ? 'text-orange-400' : 'text-yellow-400'}`}>
                {suspicion}%
              </span>
            </div>
            
            {/* Multi-tier progress indicator */}
            <div className="h-3 w-full bg-black border border-[#143a14] rounded-sm relative overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  suspicion > 80 ? 'bg-red-500 animate-pulse' : suspicion > 60 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${suspicion}%` }}
              />
              
              {/* Threshold indicator lines */}
              <div className="absolute top-0 bottom-0 left-[60%] border-l border-orange-500/50" title="UN Investigation Threshold" />
              <div className="absolute top-0 bottom-0 left-[80%] border-l border-red-500 animate-pulse" title="Security Council Sanctions Threshold" />
            </div>

            <div className="flex justify-between items-center text-[8px] text-gray-500 mt-1">
              <span>0% NOMINAL</span>
              <span className={suspicion > 60 ? 'text-orange-400 font-bold' : ''}>60% UN INVESTIGATION</span>
              <span className={suspicion > 80 ? 'text-red-500 font-bold animate-pulse' : ''}>80% GLOBAL SANCTIONS</span>
            </div>
          </div>

          {/* ESCALATION STATUS AND LAWS */}
          <div className="lg:col-span-4 pl-4 border-l border-[#1a5c1a]/30 flex flex-col justify-center text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">UN MONITOR LEVEL:</span>
              <span className={`font-bold ${suspicion > 60 ? 'text-orange-400 animate-pulse' : 'text-[#00ff44]'}`}>
                {suspicion > 60 ? '⚠️ SUSPICIOUS - BREACH INVESTIGATION ONGOING' : '✓ NOMINAL'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">IMPOSED EMBARGOES:</span>
              <span className={`font-bold ${suspicion > 80 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                {suspicion > 80 ? '🔒 ACTIVE SANCTIONS APPLIED' : '✓ NONE'}
              </span>
            </div>
            <div className="flex justify-between text-[9px] text-[#00ff44]/70 pt-1">
              <span>* High procurement risk increases tracking exposure. Suspicion decays by -1% every 2 ticks.</span>
            </div>
          </div>
        </div>

        {/* TRANSIT & PIPELINE SMUGGLING SECTION */}
        {pendingDeliveries.length > 0 && (
          <div className="bg-[#050f05] border border-cyan-800/60 p-4 rounded-md">
            <span className="text-cyan-400 text-xs font-black uppercase tracking-widest block mb-3">
              🛰️ ACTIVE SMUGGLING TRANSIT PIPELINE ({pendingDeliveries.length} CONSIGNMENTS)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingDeliveries.map((del) => {
                const ticksRemaining = (del.deliveryTick ?? 0) - currentTick;
                return (
                  <div key={del.id} className="bg-black/60 border border-cyan-950 p-2.5 rounded flex items-center justify-between text-[10px]">
                    <div className="flex flex-col space-y-1">
                      <span className="text-white font-bold text-xs uppercase">{del.itemType.replace('_', ' ')}</span>
                      <span className="text-gray-500 text-[8px]">LOT ID: {del.id} • SMUGGLER REF: {del.sellerTag}</span>
                    </div>
                    <div className="text-right flex flex-col justify-center items-end">
                      <span className="text-cyan-400 font-bold uppercase animate-pulse">SMUGGLING IN TRANSIT</span>
                      <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 border border-cyan-800 rounded font-mono mt-1">
                        ETA: {Math.max(0, ticksRemaining)} TICKS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MULTI_COLUMN GRID OF LOT CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* Main Bid Screen */}
          <div className="lg:col-span-9 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#143a14] pb-2">
                <span className="text-[#00ff44] text-sm font-black uppercase tracking-widest">
                  ⚡ LIVE COUNTER-INTELLIGENCE PROCUREMENT GRID
                </span>
                <span className="text-[10px] text-gray-500 uppercase">
                  GRID SYNCED AT CURRENT TICK: {currentTick}
                </span>
              </div>

              {liveLots.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-[#020502]/85 border border-dashed border-[#1a5c1a]/30 rounded-md text-center h-full">
                  <span className="text-2xl mb-2">📡</span>
                  <span className="text-white font-bold uppercase tracking-wider">No active black-market auctions</span>
                  <span className="text-[10px] text-gray-500 uppercase mt-1 max-w-md">
                    Satellite telemetry monitoring black budget frequencies. The smuggling ring recruits new lots periodically. Stand by for the next trade wave (30% chance every 5 ticks).
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveLots.map((lot) => {
                    const ticksRemaining = lot.expiresAtTick - currentTick;
                    const isPlayerLeading = lot.currentLeaderId === 'PLAYER';
                    const hasBidError = errorMsgs[lot.id];
                    const placeholderBid = Math.ceil(lot.currentBid * 1.1);

                    // Detect active background color flash
                    const flashStatus = lastUpdatedLots[lot.id];
                    const borderFlashClass = flashStatus === 'player' 
                      ? 'border-green-400 bg-green-950/20 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                      : flashStatus === 'ai'
                      ? 'border-red-400 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                      : isPlayerLeading
                      ? 'border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.08)] bg-emerald-950/5'
                      : lot.currentLeaderId
                      ? 'border-red-900/60 shadow-[0_0_12px_rgba(239,68,68,0.04)] hover:border-red-800/80 bg-red-950/2'
                      : 'border-[#1a5c1a]';

                    return (
                      <div 
                        key={lot.id} 
                        className={`flex flex-col justify-between border rounded-md p-4 bg-[#030603]/95 relative transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,68,0.06)] ${borderFlashClass}`}
                      >
                        
                        {/* Expiry T-Ticker */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 border font-mono font-bold tracking-wider rounded-sm ${
                            ticksRemaining <= 3 
                              ? 'border-red-500 text-red-500 bg-red-950/50 animate-pulse' 
                              : 'border-cyan-800 text-cyan-400 bg-cyan-950/20'
                          }`}>
                            T-{ticksRemaining} TICKS LEFT
                          </span>
                        </div>

                        {/* Lot Header Info */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-black tracking-widest uppercase border px-1 rounded-sm ${
                              lot.rarity === 'RARE' 
                                ? 'text-purple-400 border-purple-800 bg-purple-950/20 animate-pulse' 
                                : 'text-gray-400 border-gray-700 bg-gray-800/20'
                            }`}>
                              {lot.rarity}
                            </span>
                            <span className="text-gray-500 text-[8px] font-mono tracking-widest">LOT ID: {lot.id}</span>
                          </div>
                          
                          <div className="text-white text-sm font-black uppercase tracking-wide">
                            {lot.title}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            Type: <span className="text-cyan-400 font-bold uppercase">{lot.itemType.replace('_', ' ')}</span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            Source Broker: <span className="text-yellow-600 font-extrabold">{lot.sellerTag}</span>
                          </div>
                        </div>

                        {/* Description Body with Real Gameplay effects */}
                        <div className="bg-[#050a05] border border-[#103010]/60 p-2.5 rounded-sm min-h-[75px] flex flex-col justify-between mb-4">
                          <span className="text-[10px] text-gray-400 leading-snug font-mono">
                            {lot.description}
                          </span>
                          <span className="text-[8px] bg-[#0c1c0c] border border-emerald-950 text-[#00ff44]/75 px-1.5 py-0.5 mt-2 rounded-sm block font-sans">
                            ⚠️ Wins Exposure Cost: <span className="font-bold text-yellow-500 font-mono">+{lot.suspicionOnWin}% Suspicion</span>
                          </span>
                          <span className="text-[8px] text-cyan-400 font-sans mt-1">
                            📦 Delivery Transit Pipeline: <span className="font-bold font-mono">3 TICKS ETA (On Win)</span>
                          </span>
                        </div>

                        {/* High Bidding Status Metrics */}
                        <div className="grid grid-cols-2 gap-2 border-t border-b border-[#143a14]/60 py-3 mb-4 text-[10px] bg-black/40 px-2 rounded-sm select-none">
                          <div className="flex flex-col space-y-0.5">
                            <span className="text-gray-500 font-bold uppercase">CURRENT HIGHEST BID:</span>
                            <span className="text-[#00ff44] text-lg font-black tracking-widest font-mono">
                              $<AnimatedValue target={lot.currentBid} formatter={(v) => v.toFixed(2)} />B
                            </span>
                          </div>
                          <div className="flex flex-col space-y-0.5 text-right">
                            <span className="text-gray-500 font-bold uppercase">LEADING AGENT:</span>
                            <span className={`text-xs font-black font-mono mt-1 ${
                              isPlayerLeading 
                                ? 'text-emerald-400 animate-pulse font-extrabold' 
                                : lot.currentLeaderId 
                                ? 'text-red-400 font-bold' 
                                : 'text-gray-500'
                            }`}>
                              {isPlayerLeading ? '● PLAYER (YOU)' : lot.currentLeaderId ? `● AI POWER: ${lot.currentLeaderId}` : '● SECURE SIGNAL'}
                            </span>
                          </div>
                        </div>

                        {/* Bidding status caution notes */}
                        <div className="mb-3 select-none">
                          {flashStatus === 'player' ? (
                            <div className="bg-emerald-900/60 border border-emerald-400 text-white text-[8px] p-1.5 text-center font-bold tracking-wider animate-pulse rounded-sm uppercase">
                              ⚡ TRANSMITTING ENCRYPTED BID SIGNAL...
                            </div>
                          ) : flashStatus === 'ai' ? (
                            <div className="bg-red-950 border border-red-500 text-red-400 text-[8px] p-1.5 text-center font-bold tracking-wider animate-pulse rounded-sm uppercase">
                              ⚠️ OUTBID ALERT: COMPETING POWER ESCALATED!
                            </div>
                          ) : isPlayerLeading ? (
                            <div className="bg-emerald-950/30 border border-emerald-800 text-emerald-400 text-[8px] p-1.5 text-center font-bold tracking-wider animate-pulse rounded-sm uppercase">
                              📡 DIRECTIVE CONFIRMED: PLAYER LEADS BID CORRIDOR
                            </div>
                          ) : lot.currentLeaderId ? (
                            <div className="bg-red-950/40 border border-red-900 text-red-500 text-[8px] p-1.5 text-center font-bold tracking-wider animate-pulse rounded-sm uppercase">
                              ⚠️ EXPOSURE SENSOR: YOU HAVE BEEN OUTBID!
                            </div>
                          ) : (
                            <div className="bg-[#050a05] border border-[#143a14] text-gray-500 text-[8px] p-1.5 text-center font-bold tracking-wider rounded-sm uppercase">
                              ✓ STANDBY NO ACTIVE BIDDERS REGISTERED
                            </div>
                          )}
                        </div>

                        {/* Operational controls for Bid placement */}
                        <div className="space-y-2 mt-auto">
                          
                          {/* Quick Raise Multiports (+5%, +10%, +20%) */}
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] text-gray-500 mr-1">QUICK ADJUST:</span>
                            {[0.05, 0.10, 0.20].map((rate) => {
                              const raiseVal = lot.currentBid * (1 + rate);
                              const isDisabled = cashB < raiseVal;
                              return (
                                <button
                                  key={rate}
                                  onClick={() => handleQuickRaise(lot.id, lot.currentBid, rate)}
                                  disabled={isDisabled}
                                  className={`flex-1 py-1 text-[8px] font-bold border rounded transition-all cursor-pointer ${
                                    isDisabled 
                                      ? 'border-gray-900 text-gray-700 bg-black' 
                                      : 'border-[#1a5c1a] text-[#00ff44] bg-[#0c240c]/40 hover:bg-[#00ff44] hover:text-black'
                                  }`}
                                  title={`Raise bid by ${Math.round(rate * 100)}%`}
                                >
                                  +{Math.round(rate * 100)}%
                                </button>
                              );
                            })}
                          </div>

                          {/* Manual Input Container */}
                          <div className="flex gap-1.5 items-center">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                placeholder={`Enter $B (min: ${placeholderBid}B)`}
                                value={bidInputs[lot.id] || ''}
                                onChange={(e) => setBidInputs({ ...bidInputs, [lot.id]: e.target.value })}
                                className="bg-black border border-[#1a5c1a] focus:border-[#00ff44] text-[#00ff44] outline-none text-[10px] px-2.5 py-1.5 w-full rounded font-mono"
                              />
                              <span className="absolute right-2.5 top-1.5 text-[8px] text-gray-500 font-mono font-bold">$B</span>
                            </div>
                            <button
                              onClick={() => handleBidSubmit(lot.id)}
                              className="px-3 py-1.5 bg-[#0c2e0c] hover:bg-[#00ff44] hover:text-black border border-[#1a5c1a] text-[9px] font-black uppercase rounded cursor-pointer transition-all shrink-0 select-none"
                            >
                              SUBMIT BID
                            </button>
                          </div>

                          {/* Error feedback logs */}
                          {hasBidError && (
                            <div className="text-[8px] font-bold text-red-500 border-l-2 border-red-800 pl-1.5 mt-1 animate-pulse font-mono">
                              {hasBidError}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Upcoming drops rumormill & ticker */}
          <div className="lg:col-span-3 flex flex-col space-y-6 border-l border-[#1a5c1a]/30 pl-0 lg:pl-6">
            
            {/* Hacker terminal chatter ticker */}
            <div className="bg-black/80 border border-[#1a5c1a]/40 p-4 rounded-md space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-yellow-500 text-xs font-black uppercase tracking-widest block mb-1.5 border-b border-yellow-900 pb-1">
                  📡 LIVE BLACK NET FEED
                </span>
                <div className="space-y-1.5 max-h-[140px] overflow-hidden">
                  {hackerChatter.map((chat, idx) => (
                    <div key={idx} className="text-[9px] text-[#00ff44]/75 font-mono leading-tight border-b border-[#143a14]/20 pb-1.5 last:border-0">
                      <span className="text-gray-500 mr-1">[{new Date().toLocaleTimeString()}]</span>
                      {chat}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[8px] text-yellow-500/60 uppercase text-right tracking-wider pt-2 border-t border-yellow-950 animate-pulse font-bold">
                ● BROADCAST TUNER SECURED • DECRYPTION ACTIVE
              </div>
            </div>

            {/* Upcoming drops leaks manifest */}
            <div className="bg-[#050f05]/30 border border-[#1a5c1a]/40 p-4 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-purple-400 text-xs font-black uppercase tracking-widest">
                  🛰️ INCOMING MANIFESTS
                </span>
                <span className="text-[8px] bg-purple-950 text-purple-300 px-1 border border-purple-800 uppercase animate-pulse">
                  QUEUED LEAKS
                </span>
              </div>
              <div className="space-y-3.5">
                {incomingRumors.map((rumor) => (
                  <div key={rumor.id} className="bg-black/60 border border-purple-950/60 p-2.5 rounded-sm text-[10px] space-y-1.5 hover:border-purple-800/80 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold tracking-wide uppercase text-[11px]">{rumor.title}</span>
                      <span className="text-[8px] font-mono text-purple-400 font-extrabold bg-[#1a0c24] px-1.5 border border-purple-950">{rumor.eta}</span>
                    </div>
                    <p className="text-gray-400 font-mono text-[9px] leading-tight">
                      {rumor.chatter}
                    </p>
                    <div className="text-[8px] text-yellow-600 font-bold font-mono">
                      Expected Broker: {rumor.broker}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[8px] text-gray-500 mt-3 hover:text-white transition-colors cursor-help">
                ⓘ Direct telemetry indicates those lots are on approach coordinates. Stand by to bid as current lots expire.
              </div>
            </div>

          </div>

        </div>

        {/* METADATA CODES FOOTER */}
        <div className="border-t border-[#1a5c1a]/30 pt-4 text-[9px] text-gray-600 uppercase flex justify-between tracking-wider select-none">
          <span>* BLACK NET ROUTING PORT: SECURITY ACTIVE</span>
          <span>TRANSIT CHANNELS ENCRYPTED • ALL SALW SHIPMENTS CERTIFIED UNDER GOTHAM ACCORDS</span>
          <span>SYSTEM TIME: {new Date().toLocaleTimeString()}</span>
        </div>

      </div>
    </div>
  );
}
