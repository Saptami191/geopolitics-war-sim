import test from 'node:test';
import assert from 'node:assert/strict';
import { CommodityEngine } from './CommodityEngine';

test('CommodityEngine delegates the existing market step logic', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;

  try {
    const draft = {
      countries: {
        CN: {
          id: 'CN',
          economic: { sanctionedBy: [] },
          atWarWith: [],
        },
      },
      commodityMarkets: [
        {
          type: 'OIL',
          spotPriceUSD: 100,
          baselinePrice: 100,
          volatilityIndex: 1,
          supplyShockActive: false,
          priceHistory: [],
        },
      ],
    } as any;

    const engine = new CommodityEngine();
    engine.step(draft);

    assert.notEqual(draft.commodityMarkets[0].spotPriceUSD, 100);
    assert.equal(draft.commodityMarkets[0].priceHistory.length, 1);
  } finally {
    Math.random = originalRandom;
  }
});
