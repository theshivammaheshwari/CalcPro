import { useState, createContext, useContext, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CreditCard, User, TrendingUp, Split, Coins,
  DollarSign, MapPin, Calendar, Weight, Users, Calculator, Menu, X,
  Palette, Coffee, Zap, ArrowDownToLine, LogOut
} from 'lucide-react';
import CreditCardEMI from './components/calculators/CreditCardEMI';
import PersonalLoanEMI from './components/calculators/PersonalLoanEMI';
import LoanPrepayment from './components/calculators/LoanPrepayment';
import StockAverage from './components/calculators/StockAverage';
import StockSplit from './components/calculators/StockSplit';
import SIPCalculator from './components/calculators/SIPCalculator';
import FutureValue from './components/calculators/FutureValue';
import TripCost from './components/calculators/TripCost';
import AgeCalculator from './components/calculators/AgeCalculator';
import BMICalculator from './components/calculators/BMICalculator';
import GroupSplitter from './components/calculators/GroupSplitter';
import HireMe from './components/HireMe';
import Dashboard from './components/Dashboard';
import Footer from './components/layout/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';

export function LoginButton({ onDashboard }: { onDashboard: () => void }) {
  const { user, loginWithGoogle, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  if (user) {
    return (
      <div className="flex items-center relative" ref={menuRef}>
        <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center justify-center w-10 h-10 rounded-full hover:ring-2 hover:ring-indigo-100 transition-all focus:outline-none">
          {user.photoURL ? <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" /> : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 shadow-sm">{user.displayName?.charAt(0) || 'U'}</div>}
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
            <div className="px-3 py-2 border-b border-gray-100 mb-2">
              <p className="text-sm font-bold text-gray-800 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
            </div>
            <button onClick={() => { setMenuOpen(false); onDashboard(); }} className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors mb-1">
              My Saved Data
            </button>
            <button onClick={() => { setMenuOpen(false); logout(); }} className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              Log Out <LogOut className="w-4 h-4 opacity-80" />
            </button>
          </div>
        )}
      </div>
    );
  }
  return (
    <button onClick={loginWithGoogle} className="px-5 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md">
      Log In
    </button>
  );
}

// ─── THEME CONFIGURATION ────────────────────────────
export type ThemeId = 'indigo' | 'rose' | 'emerald' | 'amber';

export interface Theme {
  id: ThemeId;
  name: string;
  label: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryText: string;
  gradient: string;
  headerGradient: string;
  accent: string;
  ring: string;
  shadow: string;
  dot: string;
}

export const themes: Theme[] = [
  {
    id: 'indigo', name: '💙 Ocean', label: 'Ocean',
    primary: 'bg-indigo-600', primaryHover: 'hover:bg-indigo-700',
    primaryLight: 'bg-indigo-50', primaryText: 'text-indigo-600',
    gradient: 'from-indigo-600 to-cyan-500',
    headerGradient: 'from-slate-50 via-white to-indigo-50',
    accent: '#4F46E5', ring: 'focus:ring-indigo-400',
    shadow: 'shadow-indigo-200', dot: 'bg-indigo-500',
  },
  {
    id: 'rose', name: '🌸 Blossom', label: 'Blossom',
    primary: 'bg-rose-600', primaryHover: 'hover:bg-rose-700',
    primaryLight: 'bg-rose-50', primaryText: 'text-rose-600',
    gradient: 'from-rose-600 to-pink-500',
    headerGradient: 'from-slate-50 via-white to-rose-50',
    accent: '#E11D48', ring: 'focus:ring-rose-400',
    shadow: 'shadow-rose-200', dot: 'bg-rose-500',
  },
  {
    id: 'emerald', name: '🍃 Forest', label: 'Forest',
    primary: 'bg-emerald-600', primaryHover: 'hover:bg-emerald-700',
    primaryLight: 'bg-emerald-50', primaryText: 'text-emerald-600',
    gradient: 'from-emerald-600 to-teal-500',
    headerGradient: 'from-slate-50 via-white to-emerald-50',
    accent: '#059669', ring: 'focus:ring-emerald-400',
    shadow: 'shadow-emerald-200', dot: 'bg-emerald-500',
  },
  {
    id: 'amber', name: '🌅 Sunset', label: 'Sunset',
    primary: 'bg-amber-500', primaryHover: 'hover:bg-amber-600',
    primaryLight: 'bg-amber-50', primaryText: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500',
    headerGradient: 'from-slate-50 via-white to-amber-50',
    accent: '#F59E0B', ring: 'focus:ring-amber-400',
    shadow: 'shadow-amber-200', dot: 'bg-amber-500',
  },
];

export const ThemeContext = createContext<Theme>(themes[0]);
export const useTheme = () => useContext(ThemeContext);

// ─── CALCULATOR DEFINITIONS ────────────────
type CalcId =
  | 'credit-card-emi' | 'personal-loan-emi' | 'loan-prepayment'
  | 'stock-average' | 'stock-split' | 'sip' | 'future-value'
  | 'age' | 'bmi'
  | 'trip-cost' | 'group-splitter'
  | 'hire-me' | 'dashboard';

interface CalcItem {
  id: CalcId; label: string; icon: React.ReactNode;
  category: 'Finance' | 'Investment' | 'Lifestyle' | 'Trip' | 'Developer';
  color: string; bgColor: string;
}

const calculators: CalcItem[] = [
  ...[
    { id: 'credit-card-emi', label: 'Credit Card EMI', icon: <CreditCard className="w-4 h-4" />, category: 'Finance', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'personal-loan-emi', label: 'Personal Loan EMI', icon: <User className="w-4 h-4" />, category: 'Finance', color: 'text-violet-600', bgColor: 'bg-violet-50' },
    { id: 'loan-prepayment', label: 'Loan Prepayment', icon: <ArrowDownToLine className="w-4 h-4" />, category: 'Finance', color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { id: 'stock-average', label: 'Stock Average', icon: <TrendingUp className="w-4 h-4" />, category: 'Investment', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { id: 'stock-split', label: 'Stock Split', icon: <Split className="w-4 h-4" />, category: 'Investment', color: 'text-teal-600', bgColor: 'bg-teal-50' },
    { id: 'sip', label: 'SIP Calculator', icon: <Coins className="w-4 h-4" />, category: 'Investment', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'future-value', label: 'Future Value', icon: <DollarSign className="w-4 h-4" />, category: 'Investment', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'age', label: 'Age Calculator', icon: <Calendar className="w-4 h-4" />, category: 'Lifestyle', color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { id: 'bmi', label: 'BMI Calculator', icon: <Weight className="w-4 h-4" />, category: 'Lifestyle', color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'trip-cost', label: 'Trip Cost', icon: <MapPin className="w-4 h-4" />, category: 'Trip', color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    { id: 'group-splitter', label: 'Group Splitter', icon: <Users className="w-4 h-4" />, category: 'Trip', color: 'text-sky-600', bgColor: 'bg-sky-50' },
    { id: 'hire-me', label: 'Hire Me', icon: <Zap className="w-4 h-4" />, category: 'Developer', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  ] as CalcItem[]
];

const categories = ['Finance', 'Investment', 'Lifestyle', 'Trip', 'Developer'] as const;

const categoryMeta: Record<string, { gradient: string; emoji: string }> = {
  Finance:    { gradient: 'from-blue-600 to-violet-600',   emoji: '💳' },
  Investment: { gradient: 'from-emerald-600 to-indigo-600', emoji: '📈' },
  Lifestyle:  { gradient: 'from-pink-600 to-red-600',       emoji: '🏃' },
  Trip:       { gradient: 'from-cyan-600 to-sky-600',       emoji: '✈️' },
  Developer:  { gradient: 'from-yellow-400 to-amber-600',   emoji: '⭐' },
};

function renderCalculator(id: CalcId, loadData: any, handleSelect: any) {
  if (id === 'dashboard') return <Dashboard onLoad={handleSelect} />;
  switch (id) {
    case 'credit-card-emi':   return <CreditCardEMI />;
    case 'personal-loan-emi': return <PersonalLoanEMI initialData={loadData} />;
    case 'loan-prepayment':   return <LoanPrepayment initialData={loadData} />;
    case 'stock-average':     return <StockAverage />;
    case 'stock-split':       return <StockSplit />;
    case 'sip':               return <SIPCalculator />;
    case 'future-value':      return <FutureValue />;
    case 'age':               return <AgeCalculator />;
    case 'bmi':               return <BMICalculator />;
    case 'trip-cost':         return <TripCost initialData={loadData} />;
    case 'group-splitter':    return <GroupSplitter initialData={loadData} />;
    case 'hire-me':           return <HireMe onBack={() => {}} />;
  }
}

// ─── BUY ME A COFFEE ─────────────────────────
function BuyMeACoffeeBtn() {
  const theme = useTheme();
  const handleClick = () => {
    if (typeof (window as any).Razorpay === 'undefined') {
      window.open('https://razorpay.me/@calcsuitepro', '_blank');
      return;
    }
    const options = {
      key: "rzp_live_WbMdjDSTBNEsE3",
      amount: 10000,
      currency: "INR",
      name: "Trip Calculator",
      description: "Support the developer",
      handler: function (response: any) {
        alert("Thank you for your support! Payment ID: " + response.razorpay_payment_id);
      },
      prefill: {
        email: "247shivam@gmail.com",
        contact: "+91 9468955596",
      },
      theme: { color: theme.accent },
    };

    if (typeof (window as any).Razorpay !== 'undefined') {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      window.open('https://razorpay.me/@calcsuitepro', '_blank');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-full shadow-lg shadow-yellow-300/50 transition-colors"
    >
      <Coffee className="w-5 h-5" />
      <span className="hidden sm:inline text-sm">Buy Me Coffee</span>
    </button>
  );
}

// ─── THEME PICKER ─────────────────────────────
function ThemePicker({ current, onChange }: { current: ThemeId; onChange: (id: ThemeId) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
        title="Change theme"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">Theme</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 min-w-[160px]"
          >
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">Choose Theme</p>
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => { onChange(t.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:bg-gray-50 ${current === t.id ? 'bg-gray-100' : ''}`}
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${t.gradient} shadow-sm`} />
                {t.name}
                {current === t.id && <span className="ml-auto text-xs text-gray-400">✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────
export default function App() {
  const [activeCalc, setActiveCalc] = useState<CalcId>('credit-card-emi');
  const [loadData, setLoadData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeId, setThemeId] = useState<ThemeId>('indigo');

  const theme = themes.find(t => t.id === themeId)!;
  const activeItem = calculators.find(c => c.id === activeCalc) || { label: 'Dashboard', category: '', color: '', bgColor: 'bg-white', icon: <div/> };
  const activeCategory = activeItem.category;

  const handleSelect = (id: CalcId, data: any = null) => { 
    setActiveCalc(id); 
    setLoadData(data);
    setMobileMenuOpen(false); 
  };

  return (
    <AuthProvider>
      <ThemeContext.Provider value={theme}>
        <div className={`min-h-screen flex flex-col bg-gradient-to-br ${theme.headerGradient} transition-colors duration-300`}>
        {/* ── HEADER ── */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className={`p-2 bg-gradient-to-br ${theme.gradient} rounded-xl shadow-md ${theme.shadow}`}>
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-extrabold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent leading-tight`}>
                  CalcIndia
                </h1>
                <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase hidden sm:block">All-in-One Calculator</p>
              </div>
            </div>

            {/* Desktop category nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { const f = calculators.find(c => c.category === cat); if (f) handleSelect(f.id); }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                    activeCategory === cat
                      ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md ${theme.shadow}`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {categoryMeta[cat].emoji} {cat}
                </button>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2 shrink-0">
              <LoginButton onDashboard={() => handleSelect('dashboard')} />
              <ThemePicker current={themeId} onChange={setThemeId} />
              <button
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden bg-white border-t border-gray-100 px-4 pb-4"
              >
                {categories.map(cat => (
                  <div key={cat} className="mt-3">
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 bg-gradient-to-r ${categoryMeta[cat].gradient} bg-clip-text text-transparent`}>
                      {categoryMeta[cat].emoji} {cat}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                  {calculators.filter(c => c.category === cat).map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleSelect(c.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            activeCalc === c.id ? `${c.bgColor} ${c.color} font-semibold` : 'text-gray-600 hover:bg-gray-50 bg-gray-50/50'
                          }`}
                        >
                          {c.icon} {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div className="flex flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 gap-4 sm:gap-6">
          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col w-52 shrink-0">
            <div className="sticky top-20 space-y-1">
              {categories.map(cat => (
                <div key={cat} className="mb-4">
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 px-3 bg-gradient-to-r ${categoryMeta[cat].gradient} bg-clip-text text-transparent`}>
                    {categoryMeta[cat].emoji} {cat}
                  </p>
                  {calculators.filter(c => c.category === cat).map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(c.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${
                        activeCalc === c.id
                          ? `${c.bgColor} ${c.color} font-semibold shadow-sm`
                          : 'text-gray-600 hover:bg-gray-100/80'
                      }`}
                    >
                      <span className={activeCalc === c.id ? c.color : 'text-gray-400'}>{c.icon}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0">
            {/* Header strip */}
            <div className="mb-4">
              <div className={`inline-flex items-center gap-1.5 section-chip ${activeItem.bgColor} ${activeItem.color} mb-2`}>
                {activeItem.icon}
                <span>{activeItem.category}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{activeItem.label}</h2>
            </div>

            {/* Mobile sub-tabs */}
            <div className="lg:hidden flex gap-2 flex-wrap mb-4">
              {calculators.filter(c => c.category === activeCategory).map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    activeCalc === c.id ? `${c.bgColor} ${c.color}` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Calculator panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCalc}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.15 }}
                className="glass-card p-4 sm:p-6 md:p-8"
              >
                {renderCalculator(activeCalc, loadData, handleSelect)}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <Footer />
        <BuyMeACoffeeBtn />
      </div>
      </ThemeContext.Provider>
    </AuthProvider>
  );
}
