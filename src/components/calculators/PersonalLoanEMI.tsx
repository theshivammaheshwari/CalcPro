import { useState, useEffect } from 'react';
import { User, TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';
import SaveCalculation from '../SaveCalculation';

interface AmortizationRow {
  month: number;
  openingBalance: number;
  emiExGst: number;
  interest: number;
  principal: number;
  closingBalance: number;
}

interface Results {
  monthlyEmi: number;
  processingFeeAmount: number;
  gstOnProcessingFee: number;
  totalInterest: number;
  totalPaid: number;
  amortizationSchedule: AmortizationRow[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n).replace(/^/, '₹');

export default function PersonalLoanEMI({ initialData }: { initialData?: any }) {
  const [inputs, setInputs] = useState(initialData?.inputs ?? { principal: 1000000, annualRate: 12, tenureMonths: 24, processingFeeRate: 1 });
  const [results, setResults] = useState<Results | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const calculate = () => {
    const { principal, annualRate, tenureMonths, processingFeeRate } = inputs;
    const monthlyRate = annualRate / 12 / 100;
    const monthlyEmi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    const processingFeeAmount = (principal * processingFeeRate) / 100;
    const gstOnProcessingFee = (processingFeeAmount * 18) / 100;
    const schedule: AmortizationRow[] = [];
    let balance = principal, totalInterest = 0;
    for (let month = 1; month <= tenureMonths; month++) {
      const interest = balance * monthlyRate;
      const principalPayment = monthlyEmi - interest;
      schedule.push({ month, openingBalance: balance, emiExGst: monthlyEmi, interest, principal: principalPayment, closingBalance: balance - principalPayment });
      balance -= principalPayment;
      totalInterest += interest;
    }
    const totalPaid = (monthlyEmi * tenureMonths) + processingFeeAmount + gstOnProcessingFee;
    setResults({ monthlyEmi, processingFeeAmount, gstOnProcessingFee, totalInterest, totalPaid, amortizationSchedule: schedule });
    setAnimKey(k => k + 1);
  };

  useEffect(() => { calculate(); }, [inputs]);

  const set = (field: string, value: number) => setInputs(p => ({ ...p, [field]: value }));

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-1">
          <div className="bg-violet-50 rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-violet-800 flex items-center gap-2"><User className="w-5 h-5" /> Loan Details</h3>
            {[
              { label: 'Principal Amount (₹)', field: 'principal', placeholder: '10,00,000' },
              { label: 'Annual Interest Rate (%)', field: 'annualRate', placeholder: '12', step: '0.1' },
              { label: 'Tenure (Months)', field: 'tenureMonths', placeholder: '24' },
              { label: 'Processing Fee (%) + 18% GST', field: 'processingFeeRate', placeholder: '1', step: '0.1' },
            ].map(({ label, field, placeholder, step }) => (
              <div key={field}>
                <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                <input
                  type="number"
                  step={step || '1'}
                  value={inputs[field as keyof typeof inputs]}
                  onChange={e => set(field, Number(e.target.value))}
                  placeholder={placeholder}
                  className="calc-input"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5" key={animKey}>
          {results && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="result-card bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <div className="flex justify-between mb-3"><span className="font-semibold">Monthly EMI</span><DollarSign className="w-5 h-5 opacity-80" /></div>
                  <p className="text-3xl font-bold value-pop">{fmt(results.monthlyEmi)}</p>
                  <p className="text-green-100 text-xs mt-1">Fixed monthly payment</p>
                </div>
                <div className="result-card bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                  <div className="flex justify-between mb-3"><span className="font-semibold">Processing Fee</span><Percent className="w-5 h-5 opacity-80" /></div>
                  <p className="text-3xl font-bold value-pop">{fmt(results.processingFeeAmount)}</p>
                  <p className="text-orange-100 text-xs mt-1">+ {fmt(results.gstOnProcessingFee)} GST (18%)</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-violet-600" /> Payment Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Monthly EMI', value: results.monthlyEmi, color: 'text-green-700', bg: 'bg-green-50' },
                    { label: 'Processing Fee + GST', value: results.processingFeeAmount + results.gstOnProcessingFee, color: 'text-orange-700', bg: 'bg-orange-50' },
                    { label: 'Total Interest', value: results.totalInterest, color: 'text-blue-700', bg: 'bg-blue-50' },
                    { label: 'Total Amount Paid', value: results.totalPaid, color: 'text-indigo-700', bg: 'bg-indigo-50' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} p-4 rounded-xl text-center`}>
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className={`font-bold text-sm ${color}`}>{fmt(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="result-card bg-gradient-to-br from-red-500 to-rose-600 text-white">
                  <div className="flex justify-between mb-3"><span className="font-semibold">Extra Amount Paid</span><TrendingUp className="w-5 h-5 opacity-80" /></div>
                  <p className="text-3xl font-bold">{fmt(results.totalPaid - inputs.principal)}</p>
                  <p className="text-red-100 text-xs mt-1">Above principal</p>
                </div>
                <div className="result-card bg-gradient-to-br from-purple-600 to-violet-700 text-white">
                  <div className="flex justify-between mb-3"><span className="font-semibold">Effective Rate</span><Percent className="w-5 h-5 opacity-80" /></div>
                  <p className="text-3xl font-bold">{(((results.totalPaid - inputs.principal) / inputs.principal) * 100).toFixed(1)}%</p>
                  <p className="text-purple-100 text-xs mt-1">Total cost vs principal</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amortization Table */}
      {results && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-800">Amortization Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full calc-table">
              <thead>
                <tr>
                  {['Month', 'Opening Balance', 'Monthly EMI', 'Interest', 'Principal', 'Closing Balance'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.amortizationSchedule.map((row, i) => (
                  <tr key={row.month} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="font-semibold text-gray-700">{row.month}</td>
                    <td className="text-gray-600">{fmt(row.openingBalance)}</td>
                    <td className="text-blue-600 font-medium">{fmt(row.emiExGst)}</td>
                    <td className="text-red-600">{fmt(row.interest)}</td>
                    <td className="text-green-600">{fmt(row.principal)}</td>
                    <td className="text-gray-600">{fmt(row.closingBalance)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                  <td>TOTAL</td>
                  <td className="text-gray-500">—</td>
                  <td className="text-blue-700">{fmt(results.amortizationSchedule.reduce((s, r) => s + r.emiExGst, 0))}</td>
                  <td className="text-red-700">{fmt(results.totalInterest)}</td>
                  <td className="text-green-700">{fmt(inputs.principal)}</td>
                  <td>₹0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <SaveCalculation calcId="personal-loan-emi" data={{ inputs }} />
    </div>
  );
}
