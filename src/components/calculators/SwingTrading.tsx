import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, ArrowRightLeft, Activity, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../App';

interface IndexData {
  name: string;
  price: number;
  change: number;
  pct: number;
}

interface Mover {
  Symbol: string;
  Company: string;
  Price: number;
  Change: number;
  Pct: number;
}

interface StockAnalysis {
  symbol: string;
  price: number | "N/A";
  rsi: number | "N/A";
  macd: number | "N/A";
  ema10: number | "N/A";
  ema20: number | "N/A";
  signal: string;
  error?: string;
}

export default function SwingTrading() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'analysis' | 'compare'>('analysis');
  
  const [indices, setIndices] = useState<IndexData[] | null>(null);
  const [loadingIndices, setLoadingIndices] = useState(true);
  
  const [gainers, setGainers] = useState<Mover[]>([]);
  const [losers, setLosers] = useState<Mover[]>([]);
  const [loadingMovers, setLoadingMovers] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{symbol: string; name: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [analyzingTicker, setAnalyzingTicker] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<StockAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  
  const [compareInput, setCompareInput] = useState('');
  const [compareResults, setCompareResults] = useState<StockAnalysis[]>([]);
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState('');

  // Add debouncing to avoid API flooding
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    fetchIndices();
    fetchMovers();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      handleSearch(debouncedSearch);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearch]);

  const fetchIndices = async () => {
    setLoadingIndices(true);
    try {
      const res = await fetch('/api/market/indices');
      if (res.ok) setIndices(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIndices(false);
    }
  };

  const fetchMovers = async () => {
    setLoadingMovers(true);
    try {
      const res = await fetch('/api/market/movers');
      if (res.ok) {
        const data = await res.json();
        setGainers(data.gainers || []);
        setLosers(data.losers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMovers(false);
    }
  };

  const handleSearch = async (q: string) => {
    try {
      const res = await fetch(`/api/stock/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyze = async (ticker: string) => {
    if (!ticker) return;
    setAnalyzingTicker(ticker);
    setSearchQuery(ticker);
    setShowSuggestions(false);
    setAnalyzing(true);
    setAnalysisError('');
    setAnalysisResult(null);

    try {
      const res = await fetch(`/api/stock/analyze?ticker=${encodeURIComponent(ticker)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          setAnalysisError(data.error);
        } else {
          setAnalysisResult(data);
        }
      } else {
        setAnalysisError('Failed to fetch analysis.');
      }
    } catch (e) {
      setAnalysisError('Network error occurred.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCompare = async () => {
    if (!compareInput.trim()) return;
    setComparing(true);
    setCompareError('');
    setCompareResults([]);

    try {
      const res = await fetch(`/api/stocks/compare?tickers=${encodeURIComponent(compareInput)}`);
      if (res.ok) {
        const data = await res.json();
        setCompareResults(data);
      } else {
        setCompareError('Failed to fetch comparisons.');
      }
    } catch (e) {
      setCompareError('Network error occurred.');
    } finally {
      setComparing(false);
    }
  };

  const formatVal = (val: any) => {
    if (val === 'N/A' || val == null) return 'N/A';
    return Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  const getSignalColor = (signal: string) => {
    if (!signal) return 'text-gray-500';
    if (signal.includes('Strong Buy') || signal.includes('Buy')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (signal.includes('Strong Sell') || signal.includes('Sell')) return 'text-rose-600 bg-rose-50 border-rose-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className={`p-4 rounded-xl border-l-4 ${theme.primaryLight} border-${theme.id}-500 shadow-sm flex items-start gap-4`}>
        <Activity className={`w-8 h-8 ${theme.primaryText} shrink-0 mt-1`} />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Swing Trading & Technical Analysis</h2>
          <p className="text-gray-600 text-sm mb-3">
            Analyze stocks using technical indicators (RSI, MACD, EMA) to find potential swing trading opportunities.
          </p>
          <div className="bg-rose-50 p-3 rounded-lg text-xs leading-relaxed text-rose-800 border border-rose-100">
            <p className="font-bold flex items-center gap-1.5 mb-1.5 text-sm"><AlertTriangle className="w-4 h-4" /> Disclaimer / अस्वीकरण:</p>
            <p className="mb-1">This project is developed for educational and portfolio purposes only. Not financial advice. Please consult a SEBI-registered adviser before investing.</p>
            <p>यह प्रोजेक्ट केवल शैक्षिक और पोर्टफोलियो उद्देश्यों के लिए बनाया गया है। यह निवेश या वित्तीय सलाह नहीं है। कृपया निवेश से पहले SEBI-रजिस्टर्ड सलाहकार से परामर्श करें।</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`pb-3 px-4 font-semibold transition-colors duration-200 border-b-2 outline-none ${activeTab === 'analysis' ? `border-${theme.id}-500 ${theme.primaryText}` : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Analysis & Market
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`pb-3 px-4 font-semibold transition-colors duration-200 border-b-2 outline-none ${activeTab === 'compare' ? `border-${theme.id}-500 ${theme.primaryText}` : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Compare Stocks
        </button>
      </div>

      {/* View: Analysis */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Indices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loadingIndices ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse h-24"></div>
              ))
            ) : indices ? (
              indices.map(idx => {
                const isPos = idx.change >= 0;
                return (
                  <div key={idx.name} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-gray-500 mb-1">{idx.name}</p>
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-bold font-mono">₹{formatVal(idx.price)}</span>
                      <div className={`flex flex-col items-end ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <span className="flex items-center gap-1 font-semibold">
                          {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {formatVal(Math.abs(idx.change))}
                        </span>
                        <span className="text-sm font-medium">({idx.pct > 0 ? '+' : ''}{idx.pct.toFixed(2)}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="md:col-span-3 text-center text-rose-500 bg-rose-50 p-4 rounded-xl">Failed to load market indices.</div>
            )}
          </div>

          {/* Analysis Search */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Search className={`w-5 h-5 ${theme.primaryText}`} /> Stock Technical Analysis
            </h3>
            
            <div className="relative mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    placeholder="Search by Ticker or Company Name (e.g. RELIANCE, TCS)"
                    className={`w-full p-3 pl-4 border border-gray-200 rounded-xl focus:ring-2 ${theme.ring} focus:border-transparent uppercase transition-all duration-200`}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto py-1">
                      {suggestions.map(s => (
                        <li 
                          key={s.symbol}
                          onClick={() => handleAnalyze(s.symbol)}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between group"
                        >
                          <span className="font-bold text-gray-800">{s.symbol}</span>
                          <span className="text-gray-500 text-sm truncate max-w-[60%] text-right group-hover:text-gray-700">{s.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  onClick={() => handleAnalyze(searchQuery)}
                  disabled={analyzing || !searchQuery}
                  className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center ${theme.primary} ${theme.primaryHover}`}
                >
                  {analyzing ? <span className="animate-spin mr-2">⏳</span> : null}
                  Analyze
                </button>
              </div>
            </div>

            {/* Analysis Result */}
            {analysisError && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>{analysisError}</p>
              </div>
            )}

            {analysisResult && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-black text-gray-900 border-b-2 border-gray-100 pb-2 w-full">
                    {analysisResult.symbol} <span className="text-gray-400 text-base font-normal ml-2">Technical Summary</span>
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price</p>
                    <p className="text-lg font-bold text-gray-900">₹{formatVal(analysisResult.price)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 text-center uppercase tracking-wider mb-1">RSI (14)</p>
                    <p className={`text-lg font-bold ${analysisResult.rsi !== 'N/A' && Number(analysisResult.rsi) < 40 ? 'text-emerald-600' : analysisResult.rsi !== 'N/A' && Number(analysisResult.rsi) > 70 ? 'text-rose-600' : 'text-gray-900'}`}>{formatVal(analysisResult.rsi)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 text-center uppercase tracking-wider mb-1">MACD</p>
                    <p className={`text-lg font-bold ${(analysisResult.macd as number) > 0 ? 'text-emerald-600' : (analysisResult.macd as number) < 0 ? 'text-rose-600' : 'text-gray-900'}`}>{formatVal(analysisResult.macd)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">EMA (10)</p>
                    <p className="text-lg font-bold text-gray-900">{formatVal(analysisResult.ema10)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">EMA (20)</p>
                    <p className="text-lg font-bold text-gray-900">{formatVal(analysisResult.ema20)}</p>
                  </div>
                  <div className={`col-span-2 md:col-span-1 p-4 rounded-xl text-center border-2 shadow-sm flex flex-col justify-center ${getSignalColor(analysisResult.signal)}`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Signal</p>
                    <p className="text-lg font-black">{analysisResult.signal}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Movers */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border-t-4 border-t-emerald-500 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Top Gainers (Nifty)
              </h3>
              {loadingMovers ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse"></div>)}
                </div>
              ) : gainers.length > 0 ? (
                <div className="space-y-2">
                  {gainers.map((g) => (
                    <div key={g.Symbol} className="flex justify-between items-center p-3 hover:bg-emerald-50/50 rounded-lg transition-colors border border-transparent hover:border-emerald-100 cursor-pointer" onClick={() => handleAnalyze(g.Symbol)}>
                      <span className="font-bold text-gray-800">{g.Symbol}</span>
                      <div className="text-right">
                        <span className="font-mono font-medium">₹{formatVal(g.Price)}</span>
                        <span className="block text-xs font-bold text-emerald-600">+{formatVal(g.Change)} (+{g.Pct.toFixed(2)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-xl">No valid data</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border-t-4 border-t-rose-500 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" /> Top Losers (Nifty)
              </h3>
              {loadingMovers ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse"></div>)}
                </div>
              ) : losers.length > 0 ? (
                <div className="space-y-2">
                  {losers.map((l) => (
                    <div key={l.Symbol} className="flex justify-between items-center p-3 hover:bg-rose-50/50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer" onClick={() => handleAnalyze(l.Symbol)}>
                      <span className="font-bold text-gray-800">{l.Symbol}</span>
                      <div className="text-right">
                        <span className="font-mono font-medium">₹{formatVal(l.Price)}</span>
                        <span className="block text-xs font-bold text-rose-600">{formatVal(l.Change)} ({l.Pct.toFixed(2)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-xl">No valid data</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View: Compare */}
      {activeTab === 'compare' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <ArrowRightLeft className={`w-6 h-6 ${theme.primaryText}`} /> Compare Stocks
          </h3>
          <p className="text-gray-500 text-sm mb-6">Enter up to 5 comma-separated tickers to compare their technical indicators.</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              type="text"
              value={compareInput}
              onChange={(e) => setCompareInput(e.target.value.toUpperCase())}
              placeholder="e.g. RELIANCE, TCS, INFY"
              className={`flex-grow p-3 border border-gray-200 rounded-xl focus:ring-2 ${theme.ring} focus:border-transparent uppercase transition-all duration-200`}
            />
            <button
              onClick={handleCompare}
              disabled={comparing || !compareInput.trim()}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center whitespace-nowrap ${theme.primary} ${theme.primaryHover}`}
            >
              {comparing ? <span className="animate-spin mr-2">⏳</span> : null}
              Compare Now
            </button>
          </div>

          {compareError && (
             <div className="p-4 mb-6 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 flex-shrink-0" />
               <p>{compareError}</p>
             </div>
          )}

          {compareResults.length > 0 && (
            <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 hidden sm:block">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Symbol</th>
                    <th className="px-6 py-4 font-bold text-right">Price</th>
                    <th className="px-6 py-4 font-bold text-center">RSI</th>
                    <th className="px-6 py-4 font-bold text-center">MACD</th>
                    <th className="px-6 py-4 font-bold text-center">EMA10</th>
                    <th className="px-6 py-4 font-bold text-center">EMA20</th>
                    <th className="px-6 py-4 font-bold text-center">Signal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {compareResults.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-100">{r.symbol}</td>
                      {r.error ? (
                        <td colSpan={6} className="px-6 py-4 text-rose-500 text-center bg-rose-50/30 font-medium">Error: {r.error}</td>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-mono font-medium text-right bg-blue-50/10">₹{formatVal(r.price)}</td>
                          <td className={`px-6 py-4 text-center font-medium ${r.rsi !== 'N/A' && Number(r.rsi) < 40 ? 'text-emerald-600' : r.rsi !== 'N/A' && Number(r.rsi) > 70 ? 'text-rose-600' : 'text-gray-700'}`}>{formatVal(r.rsi)}</td>
                          <td className={`px-6 py-4 text-center font-medium ${(r.macd as number) > 0 ? 'text-emerald-600' : (r.macd as number) < 0 ? 'text-rose-600' : 'text-gray-700'}`}>{formatVal(r.macd)}</td>
                          <td className="px-6 py-4 text-center font-medium text-gray-700">{formatVal(r.ema10)}</td>
                          <td className="px-6 py-4 text-center font-medium text-gray-700">{formatVal(r.ema20)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-sm border ${getSignalColor(r.signal).replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', 'border-')}`}>
                              {r.signal}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Mobile view of compare results */}
          {compareResults.length > 0 && (
             <div className="sm:hidden space-y-4">
                {compareResults.map((r, i) => (
                  <div key={i} className="bg-white border text-sm border-gray-200 rounded-xl p-4 shadow-sm">
                     {r.error ? (
                        <div>
                          <p className="font-bold text-lg border-b pb-2 mb-2">{r.symbol}</p>
                          <p className="text-rose-500">{r.error}</p>
                        </div>
                     ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center border-b pb-2 mb-1">
                             <span className="font-bold text-lg text-gray-900">{r.symbol}</span>
                             <span className={`px-2 py-1 rounded text-xs font-bold border ${getSignalColor(r.signal)}`}>{r.signal}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">Price</span>
                            <span className="font-bold">₹{formatVal(r.price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">RSI</span>
                            <span className={`font-bold ${r.rsi !== 'N/A' && Number(r.rsi) < 40 ? 'text-emerald-600' : r.rsi !== 'N/A' && Number(r.rsi) > 70 ? 'text-rose-600' : 'text-gray-900'}`}>{formatVal(r.rsi)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">MACD</span>
                            <span className={`font-bold ${(r.macd as number) > 0 ? 'text-emerald-600' : (r.macd as number) < 0 ? 'text-rose-600' : 'text-gray-900'}`}>{formatVal(r.macd)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-2 pt-2 border-t">
                            <span>EMA10: {formatVal(r.ema10)}</span>
                            <span>EMA20: {formatVal(r.ema20)}</span>
                          </div>
                        </div>
                     )}
                  </div>
                ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
}