import { useState } from 'react';
import { Weight } from 'lucide-react';
import SaveCalculation from '../SaveCalculation';

type Gender = 'male' | 'female';
type Unit = 'metric' | 'imperial';

const categoryInfo: Record<string, { label: string; color: string; bgColor: string }> = {
  Underweight: { label: 'Underweight', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-300' },
  Normal: { label: 'Normal Weight', color: 'text-green-600', bgColor: 'bg-green-50 border-green-300' },
  Overweight: { label: 'Overweight', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-300' },
  Obesity: { label: 'Obesity', color: 'text-red-600', bgColor: 'bg-red-50 border-red-300' },
};

const getCategory = (bmi: number) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obesity';
};

const getBarPosition = (bmi: number) => {
  if (bmi < 18.5) return (bmi / 18.5) * 25;
  if (bmi < 25) return 25 + ((bmi - 18.5) / 6.5) * 25;
  if (bmi < 30) return 50 + ((bmi - 25) / 5) * 25;
  return Math.min(75 + ((bmi - 30) / 10) * 25, 98);
};

const getStatus = (cat: string) => {
  if (cat === 'Normal') return { msg: '🎉 Great job! You have a healthy weight.', color: 'text-green-600' };
  if (cat === 'Underweight') return { msg: '⚠️ Time to gain some healthy weight!', color: 'text-yellow-600' };
  return { msg: '🏃 Time to run! Maintaining healthy weight reduces many health risks.', color: 'text-red-600' };
};

export default function BMICalculator({ initialData }: { initialData?: any }) {
  const [gender, setGender] = useState<Gender>(initialData?.gender ?? 'male');
  const [age, setAge] = useState(initialData?.age ?? 33);
  const [height, setHeight] = useState(initialData?.height ?? 173);
  const [weight, setWeight] = useState(initialData?.weight ?? 75);
  const [unit, setUnit] = useState<Unit>(initialData?.unit ?? 'metric');
  const [bmi, setBmi] = useState<number | null>(null);

  const calculate = () => {
    const bmiVal = unit === 'metric'
      ? weight / Math.pow(height / 100, 2)
      : 703 * (weight / Math.pow(height, 2));
    setBmi(parseFloat(bmiVal.toFixed(1)));
  };

  const toggleUnit = () => {
    if (unit === 'metric') {
      setHeight(Math.round(height / 2.54));
      setWeight(Math.round(weight * 2.205));
      setUnit('imperial');
    } else {
      setHeight(Math.round(height * 2.54));
      setWeight(Math.round(weight / 2.205));
      setUnit('metric');
    }
  };

  const category = bmi ? getCategory(bmi) : '';
  const catInfo = bmi ? categoryInfo[category] : null;
  const barPos = bmi ? getBarPosition(bmi) : 0;
  const status = bmi ? getStatus(category) : null;

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          {/* Gender */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Gender</label>
            <div className="flex gap-3">
              {(['male', 'female'] as Gender[]).map(g => (
                <button key={g} onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border-2 transition-all ${
                    gender === g
                      ? g === 'male' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-pink-50 border-pink-500 text-pink-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {g === 'male' ? '👨 Male' : '👩 Female'}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Age (years)</label>
            <input type="number" min={2} max={120} value={age} onChange={e => setAge(Number(e.target.value))} className="calc-input" />
            <p className="text-xs text-gray-400 mt-1">Between 2 and 120 years</p>
          </div>

          {/* Height */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
              <button onClick={toggleUnit} className="text-xs text-indigo-600 hover:underline font-medium">
                Switch to {unit === 'metric' ? 'ft & in' : 'cm'}
              </button>
            </div>
            <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="calc-input" />
          </div>

          {/* Weight */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
            <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="calc-input" />
          </div>

          <button onClick={calculate}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-red-200 flex items-center justify-center gap-2">
            <Weight className="w-5 h-5" /> Calculate BMI
          </button>
        </div>

        {/* Result */}
        <div>
          <div className={`rounded-2xl p-6 min-h-60 border-2 transition-all duration-300 ${catInfo?.bgColor ?? 'bg-gray-50 border-gray-200'}`}>
            {bmi ? (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-gray-500 mb-1 text-sm">Your BMI is</p>
                  <p className={`text-6xl font-extrabold ${catInfo?.color}`}>{bmi}</p>
                  <p className={`text-xl font-semibold mt-2 ${catInfo?.color}`}>{catInfo?.label}</p>
                </div>

                {/* BMI Scale */}
                <div className="mt-4">
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 w-1/4" />
                    <div className="bg-green-400 w-1/4" />
                    <div className="bg-orange-400 w-1/4" />
                    <div className="bg-red-400 w-1/4" />
                  </div>
                  <div className="relative w-full mt-1">
                    <div className="absolute" style={{ left: `${barPos}%`, transform: 'translateX(-50%)' }}>
                      <div className="w-0.5 h-4 bg-gray-800 mx-auto" />
                      <div className="text-xs font-bold text-gray-800 -mt-0.5 text-center">{bmi}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-5">
                    <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obesity</span>
                  </div>
                </div>

                {status && <p className={`text-sm font-semibold text-center mt-3 ${status.color}`}>{status.msg}</p>}
                <p className="text-center text-xs text-gray-400 mt-2">Healthy BMI: 18.5 – 24.9 kg/m²</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
                <Weight className="w-12 h-12 mb-3 opacity-30" />
                Enter your details and click Calculate
              </div>
            )}
          </div>
        </div>
      </div>
      <SaveCalculation calcId="bmi" data={{ gender, age, height, weight, unit }} />
    </div>
  );
}
