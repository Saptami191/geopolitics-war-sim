import React, { useState } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { useEconomyStore } from '../../store/economyStore';
import { WeaponType } from '../../types';
import { audio } from '../../utils/audio';

interface BlackMarketBazaarProps {
  onClose: () => void;
}

interface BazaarItem {
  id: string;
  weaponType: WeaponType;
  quantity: number;
  currentBidB: number;
  buyNowB: number;
  traceRisk: number; // 0-100%
  timeLeftTicks: number;
}

export default function BlackMarketBazaar({ onClose }: BlackMarketBazaarProps) {
  const countryId = usePlayerStore((s) => s.countryId);
  const countries = useWorldStore((s) => s.countries);
  const country = countries[countryId];

  const pushTerminalLine = useUIStore((s) => s.pushTerminalLine);
  
  const [bazaarItems, setBazaarItems] = useState<BazaarItem[]>([
    { id: 'LST_001', weaponType: 'CRUISE_MISSILE', quantity: 24, currentBidB: 1.2, buyNowB: 1.8, traceRisk: 15, timeLeftTicks: 8 },
    { id: 'LST_002', weaponType: 'HYPERSONIC', quantity: 6, currentBidB: 2.1, buyNowB: 3.2, traceRisk: 65, timeLeftTicks: 4 },
    { id: 'LST_003', weaponType: 'STEALTH_BOMBER', quantity: 2, currentBidB: 1.8, buyNowB: 2.8, traceRisk: 42, timeLeftTicks: 12 },
    { id: 'LST_004', weaponType: 'EMP_DEVICE', quantity: 1, currentBidB: 0.6, buyNowB: 1.0, traceRisk: 80, timeLeftTicks: 2 },
  ]);

  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});

  if (!country) return null;

  const handleBid = (item: BazaarItem) => {
    audio.sfxKeyClick();
    const bidAmount = parseFloat(bidInputs[item.id] || '0');
    if (isNaN(bidAmount) || bidAmount <= item.currentBidB) {
      pushTerminalLine(`INVALID BID: Bid amount for ${item.id} must exceed current bid of $${item.currentBidB}B.`, 'WARNING');
      return;
    }

    const budget = country.intelligence.blackBudgetB || 5;
    if (budget < bidAmount) {
      pushTerminalLine(`INVALID BID: Insufficient black budget resources. Allocated cap is $${budget}B.`, 'CRITICAL');
      return;
    }

    // Bid succeeded
    setBazaarItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, currentBidB: bidAmount } : i
      )
    );

    // Deduct budget
    useWorldStore.getState().applyTickDelta((draft) => {
      const c = draft.countries[countryId];
      if (c) {
        c.intelligence.blackBudgetB = Math.max(0, c.intelligence.blackBudgetB - bidAmount);
      }
    });

    pushTerminalLine(`BIDS SUBMITTED: Placed $${bidAmount}B bid on [${item.id}] ${item.weaponType}. Delivery pending evaluation.`, 'INFO');
  };

  const handleBuyNow = (item: BazaarItem) => {
    audio.sfxKlaxon();
    const budget = country.intelligence.blackBudgetB || 5;
    if (budget < item.buyNowB) {
      pushTerminalLine(`BAZAAR EXCEPTION: Buyout failed. Insufficient black budget reserves.`, 'CRITICAL');
      return;
    }

    // Deliver weapons
    useWorldStore.getState().applyTickDelta((draft) => {
      const c = draft.countries[countryId];
      if (c) {
        c.intelligence.blackBudgetB = Math.max(0, c.intelligence.blackBudgetB - item.buyNowB);
        const u = c.arsenal.units.find((unit) => unit.type === item.weaponType);
        if (u) {
          u.count += item.quantity;
          u.operational += item.quantity;
        }
      }
    });

    // Remove buyout listing
    setBazaarItems((prev) => prev.filter((i) => i.id !== item.id));

    pushTerminalLine(`ARMS DELIVERY: Acquired ${item.quantity} units of ${item.weaponType} immediately. Inventory updated.`, 'INFO');
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/90 flex justify-end">
      {/* Sidebar Panel */}
      <div className="w-full max-w-xl border-l border-[#1a5c1a] bg-[#020502] h-full p-6 flex flex-col font-mono text-green-400 select-none">
        
        <div className="flex justify-between items-center border-b border-[#1a5c1a] pb-3 mb-4">
          <div className="flex flex-col">
            <span className="text-[#00ff44] text-xs font-bold font-display uppercase tracking-widest leading-none text-shadow">
              ☠️ Arms Black Market Bazaar
            </span>
            <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">
              Traceability risk active -- Anonymous buyers matrix
            </span>
          </div>
          <button
            onClick={() => { audio.sfxKeyClick(); onClose(); }}
            className="px-2.5 py-1 border border-[#1a5c1a] hover:border-red-500 hover:text-red-500 rounded text-[9px] cursor-pointer"
          >
            [CLOSE ESC]
          </button>
        </div>

        {/* Slush / Black budget index */}
        <div className="bg-[#050c05] border border-[#0d2e0d] p-3 rounded mb-4 flex justify-between items-center text-xs">
          <span>ALLOCATED SOVEREIGN BLACK BUDGET:</span>
          <span className="text-cyan-400 font-bold">${(country.intelligence.blackBudgetB || 0).toFixed(1)}B</span>
        </div>

        {/* Listings item lists */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {bazaarItems.map((item) => (
            <div key={item.id} className="border border-[#1a5c1a] bg-[#030603] p-3 rounded space-y-3">
              <div className="flex justify-between items-center border-b border-[#0d2e0d] pb-1.5">
                <div className="flex flex-col">
                  <span className="text-white text-xs font-bold uppercase">{item.weaponType.replace('_', ' ')}</span>
                  <span className="text-[8px] text-gray-500 font-mono">LOT REF: {item.id} | VOL: {item.quantity} UNITS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-red-500 border border-red-950 px-1 font-bold">
                    RISK: {item.traceRisk}% Trace
                  </span>
                  <span className="text-[8px] text-cyan-400 border border-cyan-950 px-1 font-bold">
                    T-{item.timeLeftTicks} Ticks
                  </span>
                </div>
              </div>

              <div className="text-[10px] grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-gray-500">CURRENT TARGET BID:</span>
                  <span className="text-white font-bold">${item.currentBidB.toFixed(2)}B</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-gray-500">BUYOUT VALUE:</span>
                  <span className="text-yellow-400 font-bold">${item.buyNowB.toFixed(2)}B</span>
                </div>
              </div>

              {/* Action columns */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Bid $B"
                  value={bidInputs[item.id] || ''}
                  onChange={(e) => setBidInputs({ ...bidInputs, [item.id]: e.target.value })}
                  className="bg-black border border-[#0d2e0d] focus:border-[#00ff44] text-[#00ff44] outline-none text-[10px] px-2 py-1 w-20 rounded"
                />
                <button
                  onClick={() => handleBid(item)}
                  className="flex-1 py-1.5 bg-[#0c2e0c] hover:bg-[#00ff44] hover:text-black border border-[#1a5c1a] text-[9px] font-bold uppercase rounded cursor-pointer transition-all"
                >
                  PLACE BID
                </button>
                <button
                  onClick={() => handleBuyNow(item)}
                  className="flex-1 py-1.5 bg-yellow-950 hover:bg-yellow-500 hover:text-black border border-yellow-800 text-yellow-100 text-[9px] font-bold uppercase rounded cursor-pointer transition-all"
                >
                  BUY NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
