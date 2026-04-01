import fs from 'fs';
const c = fs.readFileSync('src/components/calculators/SwingTrading.tsx', 'utf8');

const t2 = c.indexOf('{wishlist.length === 0 ? (\\n                 <div className="text-center p-8 bg-gray-50 border border-gray-200 border-dashed rounded-xl">');
const t4 = c.indexOf('{/* View: Compare */}');

const tNew = \              {wishlist.length === 0 ? (
                 <div className="text-center p-8 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                   <p className="text-gray-500">Your portfolio is empty. Search and add stocks to track them here!</p>
                 </div>
              ) : (
                 <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] sm:text-xs border-b border-gray-200">
                       <tr>
                         <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold">Symbol</th>
                         <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-right">Buy Price</th>
                         <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-right">Quantity</th>
                         <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-right">P&L</th>
                         <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-center">RSI</th>
                         <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-center">MACD</th>
                         <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-center">EMA10</th>
                         <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-center">EMA20</th>
                         <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-center">Signal</th>
                         <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-center">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {wishlist.map(item => {
                          const quote = wishlistQuotes[item.symbol] as any || {};
                          const currentPrice = quote?.price || 0;
                          
                          const hasPosition = item.buyPrice != null && item.quantity != null && currentPrice > 0;
                          const invested = hasPosition ? item.buyPrice * item.quantity : 0;
                          const currentVal = hasPosition ? currentPrice * item.quantity : 0;
                          const pnl = currentVal - invested;
                          const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                          const pnlIsUp = pnl >= 0;

                          return (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="px-4 py-3 sm:px-6 sm:py-4 border-r border-gray-100">
                                <div className="font-bold text-gray-900">{item.symbol}</div>
                                {currentPrice > 0 ? (
                                  <div className={\\\	ext-[10px] font-semibold \\\\}>
                                    ₹{formatVal(currentPrice)} ({quote?.change >= 0 ? '+' : ''}{quote?.pct?.toFixed(2)}%)
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400">Loading...</div>
                                )}
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4 text-right font-medium text-gray-700">
                                {item.buyPrice ? \\\₹\\\\ : '-'}
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4 text-right font-medium text-gray-700">
                                {item.quantity || '-'}
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4 text-right">
                                {hasPosition ? (
                                  <div>
                                    <div className={\\\ont-mono tracking-tight font-bold \\\\}>
                                      {pnlIsUp ? '+' : ''}₹{formatVal(pnl)}
                                    </div>
                                    <div className={\\\	ext-[10px] font-bold \\\\}>
                                      {pnlIsUp ? '+' : ''}{pnlPct.toFixed(2)}%
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs tracking-wider">-</span>
                                )}
                              </td>
                              <td className={\\\px-4 py-3 sm:px-6 sm:py-4 text-center font-medium \\\\}>
                                {quote?.rsi ? formatVal(quote.rsi) : '-'}
                              </td>
                              <td className={\\\px-4 py-3 sm:px-6 sm:py-4 text-center font-medium \\\\}>
                                {quote?.macd ? formatVal(quote.macd) : '-'}
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4 text-center font-medium text-gray-700">
                                {quote?.ema10 ? formatVal(quote.ema10) : '-'}
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4 text-center font-medium text-gray-700">
                                {quote?.ema20 ? formatVal(quote.ema20) : '-'}
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                {quote?.signal ? (
                                  <span className={\\\px-2 py-1 rounded text-[10px] font-bold border whitespace-nowrap bg-transparent \\\\}>
                                    {quote.signal.replace(' 🟢','').replace(' 🔴','').replace(' 🟡','')}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                                <button 
                                  onClick={() => handleDeletePortfolio(item.id)}
                                  className="p-1.5 text-gray-300 hover:bg-rose-50 hover:text-rose-500 rounded transition-all"
                                  title="Remove"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          );
                       })}
                     </tbody>
                   </table>
                 </div>
              )}
            </div>
          )}
        </div>
      )}

      \;

fs.writeFileSync('src/components/calculators/SwingTrading.tsx', c.substring(0, t2) + tNew + c.substring(t4));
console.log('Force table replace success');
