'use strict';
// Market comps — real data layer. Sources: staff-entered comps (always),
// eBay Browse API if key is set. Honest 'no-data' states, no invented prices.
const fs = require('fs'), path = require('path');

class MarketCore {
  constructor(dataDir) {
    this.file = path.join(dataDir, 'comps.json');
    if (!fs.existsSync(this.file)) fs.writeFileSync(this.file, '[]');
    this.ebayKey = process.env.GEMCORE_EBAY_KEY || '';
  }
  read() { return JSON.parse(fs.readFileSync(this.file, 'utf8')); }
  write(x) { fs.writeFileSync(this.file, JSON.stringify(x, null, 2)); }

  // staff-entered comp: {item, grade, price, source, at}
  addComp(c) {
    const comps = this.read();
    const rec = { id: 'C-' + Date.now(), ...c, at: new Date().toISOString() };
    comps.push(rec); this.write(comps);
    return rec;
  }

  // comps for an item name (fuzzy contains-match)
  compsFor(name) {
    const q = (name || '').toLowerCase();
    return this.read().filter(c => c.item.toLowerCase().includes(q) || q.includes(c.item.toLowerCase()));
  }

  // eBay sold-price adapter — needs an OAuth token; returns null offline
  async ebaySold(query) {
    if (!this.ebayKey) return { status: 'offline', reason: 'GEMCORE_EBAY_KEY not set — enter comps manually' };
    try {
      const res = await fetch(
        `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&filter=conditionIds:{1000|2000}&limit=10`,
        { headers: { Authorization: `Bearer ${this.ebayKey}` } });
      const d = await res.json();
      const items = (d.itemSummaries || []).map(i => ({ price: +i.price.value, title: i.title }));
      const prices = items.map(i => i.price).filter(Boolean);
      return {
        status: 'ok', source: 'ebay-browse', count: prices.length,
        median: prices.length ? prices.sort((a, b) => a - b)[prices.length >> 1] : null,
        items: items.slice(0, 8),
      };
    } catch (e) { return { status: 'error', reason: e.message }; }
  }

  // the estimator: comps median → grade curve → trend
  estimate(name, grade, popCount = 0) {
    const comps = this.compsFor(name);
    const prices = comps.map(c => c.price).filter(p => p > 0);
    const raw = prices.length ? prices.sort((a, b) => a - b)[prices.length >> 1] : null;
    if (raw == null) return { status: 'no-data', reason: 'no comps on file — staff adds sold prices or eBay key' };
    const gradeCurve = Math.pow((grade || 5) / 5, 2.2);
    const scarcity = 1 + 0.15 / (1 + popCount);
    const value = raw * gradeCurve * scarcity;
    return { status: 'ok', raw, compCount: prices.length, gradeCurve: +gradeCurve.toFixed(3), scarcity: +scarcity.toFixed(3), estimate: +value.toFixed(2) };
  }
}

module.exports = { MarketCore };
