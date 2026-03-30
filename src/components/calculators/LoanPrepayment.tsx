import { useState } from 'react';
import { IndianRupee, PieChart as PieIcon, ArrowDownToLine, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const COLORS = ['#ef4444', '#22c55e']; // Red for remaining interest, Green for saved

const Slider = ({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; display?: string;
}) => (
  <div>
    <div className="flex justify-between mb-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <span className="text-sm font-bold text-teal-600">{display ?? value}</span>
    </div>
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} step={step ?? 1} value={value}
        onChange={e => onChange(Number(e.target.value))} className="flex-1" />
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
    </div>
  </div>
);

export default function LoanPrepayment() {
  const [principal, setPrincipal] = useState(2500000); // 25 Lakhs
  const [rate, setRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(15);
  const [prepayment, setPrepayment] = useState(300000); // 3 Lakhs

  // Ensure robust calculations
  const calculate = () => {
    const P = principal;
    const r = (rate / 12) / 100;
    const n = tenureYears * 12;

    if (P <= 0 || r <= 0 || n <= 0) {
      return { E: 0, oldInt: 0, newInt: 0, savedInt: 0, oldMonths: 0, newMonths: 0, savedMonths: 0 };
    }

    // Original EMI
    const E = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const oldInt = (E * n) - P;

    const Pr = prepayment;
    const P_new = P - Pr;

    if (P_new <= 0) {
      return { E, oldInt, newInt: 0, savedInt: oldInt, oldMonths: n, newMonths: 0, savedMonths: n };
    }

    // Calculate new tenure based on keeping the same EMI
    // n_new = -ln(1 - (P_new * r) / E) / ln(1 + r)
    const ratio = 1 - (P_new * r) / E;
    
    // If ratio <= 0, it means the EMI is less than the interest generated, which shouldn't happen here.
    const n_new_exact = ratio > 0 ? -Math.log(ratio) / Math.log(1 + r) : n;
    
    const newInt = (E * n_new_exact) - P_new;
    const savedInt = oldInt - newInt;
    
    const newMonths = Math.ceil(n_new_exact);
    const savedMonths = n - newMonths;

    return {
      E,
      oldInt,
      newInt,
      savedInt: Math.max(0, savedInt),
      oldMonths: n,
      newMonths,
      savedMonths: Math.max(0, savedMonths)
    };
  };

  const res = calculate();

  const pieData = [
    { name: 'Interest to Pay', value: Math.round(res.newInt) },
    { name: 'Interest Saved', value: Math.round(res.savedInt) },
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
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



  return (
    <div className="space-y-8">
      {/* Alert / Highlight Banner */}
      {res.savedInt > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 transform transition-all hover:scale-[1.01]">
          <div>
             <h3 className="font-extrabold text-xl sm:text-2xl flex items-center gap-2 mb-1">
               <Zap className="w-6 h-6 text-yellow-300" />
               You save {fmtINR(res.savedInt)}!
             </h3>
             <p className="font-medium text-teal-50 opacity-90 text-sm sm:text-base">
               By paying {fmtINR(prepayment)} now, your loan finishes <strong className="text-white underline decoration-2 decoration-yellow-300">{res.savedMonths} months</strong> ({Math.floor(res.savedMonths / 12)} years & {res.savedMonths % 12} months) early.
             </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Slider label="Outstanding Principal (₹)" value={principal} min={100000} max={20000000}
            onChange={setPrincipal} display={fmtINR(principal)} />
            
          <Slider label="Interest Rate (% p.a.)" value={rate} min={1} max={25} step={0.1}
            onChange={setRate} display={`${rate}%`} />
            
          <Slider label="Remaining Tenure (Years)" value={tenureYears} min={1} max={30} step={0.5}
            onChange={setTenureYears} display={`${tenureYears} Yrs`} />
            
          <div className="p-5 bg-teal-50 border border-teal-100 rounded-2xl space-y-4">
            <h4 className="font-bold text-teal-900 flex items-center gap-2"><ArrowDownToLine className="w-5 h-5 text-teal-600"/> Prepayment Amount</h4>
            <Slider label="Lumpsum Payment (₹)" value={prepayment} min={10000} max={principal}
              onChange={setPrepayment} display={fmtINR(prepayment)} />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Current EMI</p>
              <p className="font-bold text-gray-900 text-lg">{fmtINR(res.E)} / mo</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Original Interest</p>
              <p className="font-bold text-gray-900 text-lg">{fmtINR(res.oldInt)}</p>
            </div>
          </div>
        </div>

        {/* Visualizer Section */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Interest Comparison</p>
          
          <div style={{ width: '100%', height: 260 }}>
            {res.savedInt > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <defs>
                     <linearGradient id="gradPay" x1="0" y1="0" x2="1" y2="1">
                       <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                       <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
                     </linearGradient>
                     <linearGradient id="gradSave" x1="0" y1="0" x2="1" y2="1">
                       <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                       <stop offset="100%" stopColor="#16a34a" stopOpacity={1} />
                     </linearGradient>
                   </defs>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    outerRadius={100} innerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={<CustomLabel />}
                    isAnimationActive={false}
                  >
                    <Cell fill="url(#gradPay)" />
                    <Cell fill="url(#gradSave)" />
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtINR(v)} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <div className="text-center text-gray-400">
                   <PieIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                   <p className="font-medium text-sm">Add prepayment to see savings</p>
                </div>
              </div>
            )}
          </div>

          {/* Before & After Timeline */}
          {res.savedMonths > 0 && (
             <div className="w-full bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h4 className="font-bold text-gray-800 text-sm">Tenure Timeline</h4>
                <div className="relative h-6 bg-red-100 rounded-full overflow-hidden flex">
                   {/* the part mapped to new tenure */}
                   <div 
                     className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all"
                     style={{ width: `${(res.newMonths / res.oldMonths) * 100}%` }}
                   >
                      New ({Math.floor(res.newMonths/12)}y {res.newMonths%12}m)
                   </div>
                   {/* the part saved (was part of old tenure) */}
                   <div 
                     className="bg-red-400 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all"
                     style={{ width: `${(res.savedMonths / res.oldMonths) * 100}%` }}
                   >
                      Saved ({Math.floor(res.savedMonths/12)}y {res.savedMonths%12}m)
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
