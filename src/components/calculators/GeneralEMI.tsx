import { useState, useEffect } from 'react';
import { IndianRupee } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const COLORS = [
  { from: '#4F46E5', to: '#818CF8' },
  { from: '#EF4444', to: '#FCA5A5' },
];

export default function GeneralEMI() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(10.5);
  const [time, setTime] = useState(5);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [principal, rate, time]);

  const monthlyRate = rate / (12 * 100);
  const months = time * 12;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalAmount = emi * months;
  const totalInterest = totalAmount - principal;

  const pieData = [
    { name: 'Principal', value: Math.round(principal) },
    { name: 'Interest', value: Math.round(totalInterest) },
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.07) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="700">{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  const Slider = ({ label, value, min, max, step, onChange, display }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; display?: string;
  }) => (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-indigo-600">{display ?? value}</span>
      </div>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))} className="flex-1" />
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <Slider label="Loan Amount" value={principal} min={100000} max={10000000} step={100000}
            onChange={setPrincipal} display={fmtINR(principal)} />
          <Slider label="Interest Rate (% p.a.)" value={rate} min={5} max={36} step={0.5}
            onChange={setRate} display={`${rate}%`} />
          <Slider label="Loan Term (Years)" value={time} min={1} max={30} step={1}
            onChange={setTime} display={`${time} Yrs`} />

          <div className="bg-indigo-50 rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" /> EMI Breakdown
            </h3>
            {[
              { label: 'Monthly EMI', value: fmtINR(emi), color: 'text-indigo-700' },
              { label: 'Total Interest', value: fmtINR(totalInterest), color: 'text-red-600' },
              { label: 'Total Amount', value: fmtINR(totalAmount), color: 'text-green-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center bg-white/70 px-4 py-2.5 rounded-xl">
                <span className="text-sm text-gray-600">{label}</span>
                <span className={`font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Pie Chart */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Principal vs Interest</p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {COLORS.map((c, i) => (
                    <linearGradient key={i} id={`emiGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%"   stopColor={c.from} stopOpacity={1} />
                      <stop offset="100%" stopColor={c.to}   stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  outerRadius={100} innerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={<CustomLabel />}
                  isAnimationActive={false}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={`url(#emiGrad${i})`} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmtINR(v)} />
                <Legend iconType="circle" iconSize={10} formatter={(value) => <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <div className="bg-indigo-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Principal</p>
              <p className="font-bold text-indigo-700">{fmtINR(principal)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Total Interest</p>
              <p className="font-bold text-red-600">{fmtINR(totalInterest)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
