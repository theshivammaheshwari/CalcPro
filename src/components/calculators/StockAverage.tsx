import { useState } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import SaveCalculation from '../SaveCalculation';

interface Entry { units: number; price: number; }
interface Results { totalUnits: number; averagePrice: number; totalAmount: number; }

const fmtINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

export default function StockAverage({ initialData }: { initialData?: any }) {
  const [entries, setEntries] = useState<Entry[]>(initialData?.entries ?? [{ units: 0, price: 0 }, { units: 0, price: 0 }]);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (i: number, field: keyof Entry, val: number) => {
    const e = [...entries];
    e[i] = { ...e[i], [field]: val };
    setEntries(e);
  };

  const calculate = () => {
    setLoading(true);
    setTimeout(() => {
      const totalUnits = entries.reduce((s, e) => s + e.units, 0);
      const totalAmount = entries.reduce((s, e) => s + e.units * e.price, 0);
      setResults({ totalUnits, averagePrice: totalUnits ? totalAmount / totalUnits : 0, totalAmount });
      setLoading(false);
    }, 400);
  };

  const clear = () => { setEntries([{ units: 0, price: 0 }, { units: 0, price: 0 }]); setResults(null); };

  const colors = ['border-blue-300 bg-blue-50', 'border-purple-300 bg-purple-50'];
  const textColors = ['text-blue-600', 'text-purple-600'];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        {entries.map((entry, i) => (
          <div key={i} className={`rounded-2xl border-2 p-6 space-y-4 ${colors[i]} transition-all duration-300`}>
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${textColors[i]}`}>
              <TrendingUp className="w-5 h-5" />
              {i === 0 ? 'First Purchase' : 'Second Purchase'}
            </h3>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Units</label>
              <input type="number" value={entry.units || ''} onChange={e => update(i, 'units', parseFloat(e.target.value) || 0)} className="calc-input" placeholder="Enter units" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Price per Share (₹)</label>
              <input type="number" value={entry.price || ''} onChange={e => update(i, 'price', parseFloat(e.target.value) || 0)} className="calc-input" placeholder="₹0.00" />
            </div>
            <div className={`flex justify-between items-center py-2 px-3 rounded-xl bg-white/70 border border-white`}>
              <span className="text-sm text-gray-600">Amount Invested:</span>
              <span className={`font-bold ${textColors[i]}`}>{fmtINR(entry.units * entry.price)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={clear} className="flex items-center gap-2 px-5 py-2.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl font-semibold transition-colors">
          <RefreshCw className="w-4 h-4" /> Clear
        </button>
        <button
          onClick={calculate}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-60"
        >
          {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Calculating...</span></> : 'Calculate Average'}
        </button>
      </div>

      {results && (
        <div className="grid sm:grid-cols-3 gap-4 animate-[popIn_0.3s_ease-out]">
          {[
            { label: 'Total Units', value: results.totalUnits.toLocaleString('en-IN'), color: 'text-gray-900', bg: 'bg-gray-50' },
            { label: 'Average Price', value: fmtINR(results.averagePrice), color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Total Amount', value: fmtINR(results.totalAmount), color: 'text-indigo-700', bg: 'bg-indigo-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} p-5 rounded-2xl text-center border border-white shadow-sm`}>
              <p className="text-sm text-gray-500 mb-2">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
      <SaveCalculation calcId="stock-average" data={{ entries }} />
    </div>
  );
}
