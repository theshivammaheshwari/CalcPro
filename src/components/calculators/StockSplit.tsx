import { useState } from 'react';
import { RefreshCw, Split } from 'lucide-react';

interface Results { newPrice: number; additionalShares: number; totalShares: number; refundAmount: number; }

const fmtINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export default function StockSplit() {
  const [currentPrice, setCurrentPrice] = useState(100);
  const [splitRatio, setSplitRatio] = useState('1:2');
  const [sharesOwned, setSharesOwned] = useState(100);
  const [results, setResults] = useState<Results | null>(null);

  const calculate = () => {
    const [newShares, oldShares] = splitRatio.split(':').map(Number);
    if (!newShares || !oldShares || newShares <= 0 || oldShares <= 0) return;
    const additionalSharesFloat = (sharesOwned / oldShares) * newShares;
    const additionalShares = Math.floor(additionalSharesFloat);
    const totalShares = sharesOwned + additionalShares;
    const newPrice = (currentPrice * sharesOwned) / totalShares;
    const fractionalShares = additionalSharesFloat - additionalShares;
    const refundAmount = fractionalShares * newPrice;
    setResults({ newPrice: Number(newPrice.toFixed(2)), additionalShares, totalShares, refundAmount: Number(refundAmount.toFixed(2)) });
  };

  const clear = () => { setCurrentPrice(100); setSplitRatio('1:2'); setSharesOwned(100); setResults(null); };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Current Stock Price (₹)</label>
            <input type="number" value={currentPrice} onChange={e => setCurrentPrice(Number(e.target.value))} className="calc-input" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Split Ratio (New:Old)</label>
            <div className="flex gap-3">
              <input type="text" value={splitRatio} onChange={e => setSplitRatio(e.target.value)} placeholder="e.g. 1:2" className="calc-input flex-1" />
              <div className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-2 rounded-xl flex items-center whitespace-nowrap">e.g. 1:2</div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Shares Owned</label>
            <input type="number" value={sharesOwned} onChange={e => setSharesOwned(Number(e.target.value))} className="calc-input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={clear} className="flex items-center gap-2 px-5 py-2.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl font-semibold transition-colors">
              <RefreshCw className="w-4 h-4" /> Clear
            </button>
            <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-md">
              <Split className="w-4 h-4" /> Calculate Split
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl space-y-3">
          <h3 className="font-semibold text-gray-800 mb-4">Split Results</h3>
          {results ? (
            <>
              {[
                { label: 'New Stock Price', value: fmtINR(results.newPrice), color: 'text-emerald-700' },
                { label: 'Additional Shares', value: results.additionalShares.toLocaleString('en-IN'), color: 'text-blue-700' },
                { label: 'Total Shares After Split', value: results.totalShares.toLocaleString('en-IN'), color: 'text-indigo-700' },
                { label: 'Fractional Share Refund', value: fmtINR(results.refundAmount), color: 'text-purple-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center bg-white/70 p-4 rounded-xl">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`text-xl font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Split className="w-12 h-12 mx-auto mb-3 opacity-30" />
              Enter values and click Calculate
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
