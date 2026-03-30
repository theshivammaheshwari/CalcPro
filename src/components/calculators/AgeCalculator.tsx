import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { format, differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';
import SaveCalculation from '../SaveCalculation';

export default function AgeCalculator({ initialData }: { initialData?: any }) {
  const [birthDate, setBirthDate] = useState(initialData?.birthDate ?? '');
  const [endDate, setEndDate] = useState(initialData?.endDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [age, setAge] = useState<{ years: number; months: number; days: number } | null>(null);
  const [error, setError] = useState('');

  const calculate = () => {
    setError('');
    try {
      const start = new Date(birthDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) { setError('Please enter valid dates'); setAge(null); return; }
      if (start > end) { setError('Birth date cannot be after end date'); setAge(null); return; }
      const years = differenceInYears(end, start);
      const afterYears = new Date(start.getFullYear() + years, start.getMonth(), start.getDate());
      const months = differenceInMonths(end, afterYears);
      const afterMonths = new Date(afterYears.getFullYear(), afterYears.getMonth() + months, afterYears.getDate());
      const days = differenceInDays(end, afterMonths);
      setAge({ years, months, days });
    } catch {
      setError('Error calculating age. Please check your dates.');
      setAge(null);
    }
  };

  const totalDays = age ? (age.years * 365 + age.months * 30 + age.days) : 0;
  const totalWeeks = age ? Math.floor(totalDays / 7) : 0;
  const totalHours = age ? totalDays * 24 : 0;

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Date of Birth</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="calc-input" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">End Date (default: today)</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="calc-input" />
          </div>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>
          )}
          <button
            onClick={calculate}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-pink-200 flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5" /> Calculate Age
          </button>

          {age && (
            <div className="bg-pink-50 rounded-2xl p-5 space-y-3 border border-pink-100">
              <h3 className="font-semibold text-pink-800">Additional Stats</h3>
              {[
                { label: 'Total Days (approx)', value: totalDays.toLocaleString('en-IN') },
                { label: 'Total Weeks (approx)', value: totalWeeks.toLocaleString('en-IN') },
                { label: 'Total Hours (approx)', value: totalHours.toLocaleString('en-IN') },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between bg-white/70 px-4 py-2 rounded-xl text-sm">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-bold text-pink-700">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Result */}
        <div>
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl min-h-60 flex flex-col justify-center">
            {age ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { val: age.years, label: 'Years', color: 'text-purple-600' },
                    { val: age.months, label: 'Months', color: 'text-blue-600' },
                    { val: age.days, label: 'Days', color: 'text-green-600' },
                  ].map(({ val, label, color }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                      <div className={`text-4xl font-extrabold ${color}`}>{val}</div>
                      <div className="text-sm text-gray-500 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/70 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Total Age</h3>
                  <p className="text-lg text-gray-800">
                    <span className="font-bold text-purple-600">{age.years}</span> years,{' '}
                    <span className="font-bold text-blue-600">{age.months}</span> months, and{' '}
                    <span className="font-bold text-green-600">{age.days}</span> days
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calculator className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Enter your birth date and click Calculate
              </div>
            )}
          </div>
        </div>
      </div>
      <SaveCalculation calcId="age" data={{ birthDate, endDate }} />
    </div>
  );
}
