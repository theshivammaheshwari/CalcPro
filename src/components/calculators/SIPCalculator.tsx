import { useState, useEffect } from 'react';
import { Coins, ArrowUpRight, Wallet } from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

type CalcType = 'sip' | 'step-up' | 'lumpsum';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const fmtShort = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)     return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

const PIE_COLORS = [['#4F46E5', '#818CF8'], ['#10B981', '#6EE7B7']];

const Slider = ({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display?: string;
}) => (
  <div>
    <div className="flex justify-between mb-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <span className="text-sm font-bold text-indigo-600">{display ?? value}</span>
    </div>
    <div className="flex items-center gap-2">
      <input type="range" min={min} max={max} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))} className="flex-1" />
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-24 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
    </div>
  </div>
);

export default function SIPCalculator() {
  const [type, setType] = useState<CalcType>('sip');
  const [amount, setAmount] = useState(5000);
  const [lumpsum, setLumpsum] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(10);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [type, amount, lumpsum, rate, years, stepUp]);

  const calcSIP = () => {
    const mr = rate / (12 * 100), m = years * 12;
    const fv = amount * ((Math.pow(1 + mr, m) - 1) / mr) * (1 + mr);
    return { fv: Math.round(fv), inv: Math.round(amount * m), ret: Math.round(fv - amount * m) };
  };

  const calcStepUp = () => {
    let inv = 0, fv = 0, mo = amount;
    const mr = rate / (12 * 100);
    for (let y = 0; y < years; y++) {
      for (let m = 0; m < 12; m++) { inv += mo; fv = (fv + mo) * (1 + mr); }
      mo += mo * (stepUp / 100);
    }
    return { fv: Math.round(fv), inv: Math.round(inv), ret: Math.round(fv - inv) };
  };

  const calcLumpsum = () => {
    const fv = lumpsum * Math.pow(1 + rate / 100, years);
    return { fv: Math.round(fv), inv: Math.round(lumpsum), ret: Math.round(fv - lumpsum) };
  };

  const res = type === 'sip' ? calcSIP() : type === 'step-up' ? calcStepUp() : calcLumpsum();

  const buildChart = (): { year: number; Invested: number; 'Total Value': number }[] => {
    const data = [];
    if (type === 'sip') {
      const mr = rate / (12 * 100);
      for (let y = 0; y <= years; y++) {
        const m = y * 12;
        const fv = m === 0 ? 0 : amount * ((Math.pow(1 + mr, m) - 1) / mr) * (1 + mr);
        data.push({ year: y, Invested: Math.round(amount * m), 'Total Value': Math.round(fv) });
      }
    } else if (type === 'step-up') {
      let inv = 0, fv = 0, mo = amount;
      const mr = rate / (12 * 100);
      data.push({ year: 0, Invested: 0, 'Total Value': 0 });
      for (let y = 0; y < years; y++) {
        for (let m = 0; m < 12; m++) { inv += mo; fv = (fv + mo) * (1 + mr); }
        mo += mo * (stepUp / 100);
        data.push({ year: y + 1, Invested: Math.round(inv), 'Total Value': Math.round(fv) });
      }
    } else {
      for (let y = 0; y <= years; y++)
        data.push({ year: y, Invested: lumpsum, 'Total Value': Math.round(lumpsum * Math.pow(1 + rate / 100, y)) });
    }
    return data;
  };

  const chartData = buildChart();
  // Correct pie data — two slices
  const pieData = [
    { name: 'Invested', value: res.inv },
    { name: 'Returns', value: Math.max(res.ret, 0) },
  ];



  const tabs = [
    { id: 'sip' as CalcType,      label: 'Regular SIP',   icon: <Coins className="w-4 h-4" /> },
    { id: 'step-up' as CalcType,  label: 'Step-up SIP',   icon: <ArrowUpRight className="w-4 h-4" /> },
    { id: 'lumpsum' as CalcType,  label: 'Lumpsum',       icon: <Wallet className="w-4 h-4" /> },
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="700">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-4 py-3 text-sm">
        <p className="font-bold text-gray-800 mb-1">{payload[0]?.payload?.name || payload[0]?.name}</p>
        <p className="text-indigo-600 font-bold">{fmtINR(payload[0]?.value)}</p>
        {payload[1] && <p className="text-emerald-600 font-bold">{fmtINR(payload[1]?.value)}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setType(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              type === t.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {type !== 'lumpsum' ? (
            <Slider label="Monthly Investment" value={amount} min={500} max={100000} step={500}
              onChange={setAmount} display={fmtINR(amount)} />
          ) : (
            <Slider label="Lumpsum Amount" value={lumpsum} min={10000} max={10000000} step={10000}
              onChange={setLumpsum} display={fmtINR(lumpsum)} />
          )}
          {type === 'step-up' && (
            <Slider label="Annual Step-up Rate (%)" value={stepUp} min={1} max={25} step={1}
              onChange={setStepUp} display={`${stepUp}%`} />
          )}
          <Slider label="Expected Return (% p.a.)" value={rate} min={1} max={30} step={1}
            onChange={setRate} display={`${rate}%`} />
          <Slider label="Investment Period (Years)" value={years} min={1} max={30} step={1}
            onChange={setYears} display={`${years} Yrs`} />

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Invested', value: res.inv, color: 'text-indigo-700', bg: 'bg-indigo-50' },
              { label: 'Returns', value: res.ret, color: 'text-emerald-700', bg: 'bg-emerald-50' },
              { label: 'Total', value: res.fv, color: 'text-blue-800', bg: 'bg-blue-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} p-3 rounded-xl text-center`}>
                <p className="text-[10px] text-gray-500 mb-1">{label}</p>
                <p className={`font-bold text-xs sm:text-sm ${color}`}>{fmtShort(value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          {/* Pie chart — fixed with explicit dimensions */}
          <div className="flex flex-col items-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Invested vs Returns</p>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {PIE_COLORS.map((colors, i) => (
                      <linearGradient key={i} id={`sipGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={colors[0]} stopOpacity={1} />
                        <stop offset="95%" stopColor={colors[1]} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={<CustomLabel />}
                    isAnimationActive={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={`url(#sipGrad${i})`} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area chart */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Growth Over Time</p>
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 10 }} width={48} tickLine={false} />
                  <Tooltip formatter={(v: number) => fmtINR(v)} labelFormatter={l => `Year ${l}`} content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Invested" stroke="#4F46E5" strokeWidth={2}
                    fill="url(#gradInvested)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="Total Value" stroke="#10B981" strokeWidth={2}
                    fill="url(#gradTotal)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
