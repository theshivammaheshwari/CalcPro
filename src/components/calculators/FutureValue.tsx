import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const COLORS = [
  { from: '#1e3a8a', to: '#3b82f6' },
  { from: '#ea580c', to: '#fbbf24' },
];

export default function FutureValue() {
  const [initial, setInitial] = useState(100000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(5);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [initial, rate, years]);

  const fv = initial * Math.pow(1 + rate / 100, years);
  const interest = fv - initial;

  const pieData = [
    { name: 'Principal', value: Math.round(initial) },
    { name: 'Interest', value: Math.max(Math.round(interest), 0) },
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.07) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="700">{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  const Slider = ({ label, value, min, max, step, onChange, display }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; display?: string;
  }) => (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-orange-600">{display ?? value}</span>
      </div>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))} className="flex-1" />
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <Slider label="Initial Amount (₹)" value={initial} min={1000} max={10000000} step={1000}
            onChange={setInitial} display={fmtINR(initial)} />
          <Slider label="Rate of Interest (% p.a.)" value={rate} min={1} max={30} step={0.5}
            onChange={setRate} display={`${rate}%`} />
          <Slider label="Time Period (Years)" value={years} min={1} max={30} step={1}
            onChange={setYears} display={`${years} Yrs`} />

          <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-orange-200 flex items-center justify-center gap-2">
            <DollarSign className="w-5 h-5" /> Calculate Future Value
          </button>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Present Value', value: fmtINR(initial), color: 'text-blue-900', bg: 'bg-blue-50' },
              { label: 'Total Interest', value: fmtINR(interest), color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Future Value', value: fmtINR(fv), color: 'text-blue-900', bg: 'bg-indigo-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} p-4 rounded-xl text-center border border-white shadow-sm`}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`font-bold text-sm ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Animated chart */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Principal vs Growth</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {COLORS.map((c, i) => (
                    <linearGradient key={i} id={`fvGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%"   stopColor={c.from} stopOpacity={1} />
                      <stop offset="100%" stopColor={c.to}   stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={pieData}
                  cx="50%" cy="45%"
                  outerRadius={105} innerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={<CustomLabel />}
                  isAnimationActive={animated}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {pieData.map((_, i) => <Cell key={i} fill={`url(#fvGrad${i})`} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmtINR(v)} />
                <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: 12, color: '#374151' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
