import { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const EXPENSE_TYPES = ['Food', 'Accommodation', 'Activities', 'Drinks', 'Other'];

interface Expense { type: string; amount: number; }

export default function TripCost() {
  const [distance, setDistance] = useState(530);
  const [fuelEfficiency, setFuelEfficiency] = useState(15);
  const [fuelCostPerLiter, setFuelCostPerLiter] = useState(100);
  const [people, setPeople] = useState(4);
  const [expenses, setExpenses] = useState<Expense[]>([{ type: 'Food', amount: 500 }]);
  const [newType, setNewType] = useState('Food');
  const [newAmount, setNewAmount] = useState('');

  const fuelRequired = distance / fuelEfficiency;
  const fuelCost = fuelRequired * fuelCostPerLiter;
  const totalExtra = expenses.reduce((s, e) => s + e.amount, 0);
  const totalCost = fuelCost + totalExtra;
  const perPerson = people > 0 ? totalCost / people : totalCost;

  const pieData = expenses.reduce((acc: { name: string; value: number }[], e) => {
    const ex = acc.find(x => x.name === e.type);
    if (ex) ex.value += e.amount; else acc.push({ name: e.type, value: e.amount });
    return acc;
  }, [{ name: 'Fuel', value: Math.round(fuelCost) }]);

  const addExpense = () => {
    if (newAmount && Number(newAmount) > 0) {
      setExpenses(p => [...p, { type: newType, amount: Number(newAmount) }]);
      setNewAmount('');
    }
  };

  const Slider = ({ label, value, min, max, step, onChange, suffix }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; suffix?: string;
  }) => (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-cyan-600">{value}{suffix}</span>
      </div>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))} className="flex-1" />
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <Slider label="Total Distance (km)" value={distance} min={5} max={5000} step={10} onChange={setDistance} suffix=" km" />
          <Slider label="Fuel Efficiency (km/L)" value={fuelEfficiency} min={5} max={30} step={0.5} onChange={setFuelEfficiency} suffix=" km/L" />
          <Slider label="Fuel Cost per Liter (₹)" value={fuelCostPerLiter} min={70} max={150} step={1} onChange={setFuelCostPerLiter} suffix=" ₹/L" />
          <Slider label="Number of People" value={people} min={1} max={15} step={1} onChange={setPeople} suffix=" people" />

          {/* Add expense */}
          <div className="bg-cyan-50 rounded-2xl p-5">
            <h3 className="font-semibold text-cyan-800 mb-3">Additional Expenses</h3>
            <div className="flex gap-2 mb-3">
              <select value={newType} onChange={e => setNewType(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white">
                {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)}
                placeholder="₹ Amount" className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              <button onClick={addExpense} className="p-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {expenses.map((e, i) => (
                <div key={i} className="flex justify-between items-center bg-white px-4 py-2 rounded-xl">
                  <span className="text-sm text-gray-600">{e.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">{fmtINR(e.amount)}</span>
                    <button onClick={() => setExpenses(p => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Fuel Cost', value: fuelCost, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Extra Expenses', value: totalExtra, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Total Trip Cost', value: totalCost, color: 'text-pink-600', bg: 'bg-pink-50' },
              { label: 'Cost Per Person', value: perPerson, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} p-4 rounded-xl`}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`font-bold text-lg ${color}`}>{fmtINR(value)}</p>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({ name, value }) => `${name}: ${fmtINR(value)}`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => fmtINR(Number(v))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-600" /> Trip Summary</h3>
            {[
              { label: 'Distance', value: `${distance} km` },
              { label: 'Fuel Required', value: `${fuelRequired.toFixed(1)} L` },
              { label: 'Fuel Cost', value: fmtINR(fuelCost) },
              { label: 'Additional Expenses', value: fmtINR(totalExtra) },
              { label: 'Total Cost', value: fmtINR(totalCost) },
              { label: `Split (${people} people)`, value: fmtINR(perPerson) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
