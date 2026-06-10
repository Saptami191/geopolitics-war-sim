import React, { useEffect, useState } from 'react';
import { useWorldStore } from '../../store/worldStore';

interface StockItem {
  ticker: string;
  priceUSD: number;
  change24h: number;
}

export default function StockMarketTicker() {
  const currentTick = useWorldStore((s) => s.currentTick);

  // Generate fictional defense, energy, agricultural stock prices that move with tick
  const [stocks, setStocks] = useState<StockItem[]>([
    { ticker: 'ARMACORP', priceUSD: 1420.5, change24h: 3.4 },
    { ticker: 'PETROMAX', priceUSD: 87.2, change24h: -1.2 },
    { ticker: 'DEFTECH', priceUSD: 2150.3, change24h: 8.1 },
    { ticker: 'SILICONIX', priceUSD: 312.4, change24h: 0.15 },
    { ticker: 'BOND_GLOBAL', priceUSD: 98.4, change24h: -0.4 },
    { ticker: 'AGRISC', priceUSD: 45.8, change24h: -1.6 },
    { ticker: 'PHARMASYST', priceUSD: 190.2, change24h: 1.1 },
  ]);

  // Price ticks movements
  useEffect(() => {
    setStocks((prev) =>
      prev.map((s) => {
        const pct = (Math.random() - 0.5) * 1.5;
        const newPrice = s.priceUSD * (1 + pct / 100);
        return {
          ticker: s.ticker,
          priceUSD: newPrice,
          change24h: pct + s.change24h * 0.9,
        };
      })
    );
  }, [currentTick]);

  return (
    <div className="w-full h-6 bg-[#040804] border-b border-[#1a5c1a] flex items-center overflow-hidden shrink-0 select-none z-10 font-mono text-[10px]">
      {/* Ticker marquee container */}
      <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap gap-8">
        <span className="text-[#00e5ff] font-bold">
          GLOBAL MARKET INDEX: 4,829.10
        </span>

        {stocks.map((s) => {
          const isPos = s.change24h >= 0;
          return (
            <span key={s.ticker} className="flex gap-1.5 items-center">
              <span className="text-white font-bold">{s.ticker}</span>
              <span className="text-gray-400">${s.priceUSD.toFixed(2)}</span>
              <span className={isPos ? 'text-green-400 font-bold' : 'text-red-500 font-bold'}>
                {isPos ? '▲' : '▼'}{s.change24h > 0 ? '+' : ''}{s.change24h.toFixed(1)}%
              </span>
            </span>
          );
        })}

        {/* Duplicate list to ensure continuous scrolling seamless loop */}
        <span className="text-[#00e5ff] font-bold">
          GLOBAL MARKET INDEX: 4,829.10
        </span>

        {stocks.map((s) => {
          const isPos = s.change24h >= 0;
          return (
            <span key={`dup-${s.ticker}`} className="flex gap-1.5 items-center">
              <span className="text-white font-bold">{s.ticker}</span>
              <span className="text-gray-400">${s.priceUSD.toFixed(2)}</span>
              <span className={isPos ? 'text-green-400 font-bold' : 'text-red-500 font-bold'}>
                {isPos ? '▲' : '▼'}{s.change24h > 0 ? '+' : ''}{s.change24h.toFixed(1)}%
              </span>
            </span>
          );
        })}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
