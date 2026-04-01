import fs from 'fs';
const c = fs.readFileSync('src/components/calculators/SwingTrading.tsx', 'utf8');

const tOld = \              {wishlist.length === 0 ? (
                 <div className="text-center p-8 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                   <p className="text-gray-500">Your portfolio is empty. Search and add stocks to track them here!</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {wishlist.map(item => {
                      const quote = wishlistQuotes[item.symbol];
                      const currentPrice = quote?.price || 0;
                      const dayChange = quote?.change || 0;
                      const dayPct = quote?.pct || 0;
                      const isUp = dayChange >= 0;
                      
                      const hasPosition = item.buyPrice != null && item.quantity != null && currentPrice > 0;
                      const invested = hasPosition ? item.buyPrice! * item.quantity! : 0;
                      const currentVal = hasPosition ? currentPrice * item.quantity! : 0;
                      const pnl = currentVal - invested;
                      const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                      const pnlIsUp = pnl >= 0;

                      return (
                         <div key={item.id} className="relative group bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors shadow-sm">
                           <button 
                             onClick={() => handleDeletePortfolio(item.id)}
                             className="absolute top-4 right-4 p-1.5 text-gray-300 hover:bg-rose-50 hover:text-rose-500 rounded bg-white transition-all opacity-0 group-hover:opacity-100 z-10"
                             title="Remove"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>

                           <div className="flex justify-between items-start mb-3 pr-8">
                             <div>
                               <h5 className="font-bold text-lg text-gray-900 leading-tight">{item.symbol}</h5>
                               {item.name && <p className="text-xs text-gray-500 truncate max-w-[150px]">{item.name}</p>}
                             </div>
                             
                             <div className="text-right">
                               {currentPrice > 0 ? (
                                  <>
                                     <p className="font-mono font-bold text-lg leading-tight">₹{formatVal(currentPrice)}</p>
                                     <p className={\\\	ext-xs font-bold flex items-center justify-end gap-0.5 \\\\}>
                                       {isUp ? '+' : ''}{formatVal(dayChange)} ({isUp ? '+' : ''}{dayPct.toFixed(2)}%)
                                     </p>
                                  </>
                               ) : (
                                  <p className="text-sm font-medium text-gray-400">Loading...</p>
                               )}
                             </div>
                           </div>

                           {hasPosition ? (
                              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Position</p>
                                  <p className="text-xs font-semibold text-gray-700">Avg ₹{formatVal(item.buyPrice)} • {item.quantity} Qty</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Inv: ₹{formatVal(invested)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">P&L</p>
                                  <p className={\\\ont-mono font-bold text-sm \\\\}>
                                     {pnlIsUp ? '+' : ''}₹{formatVal(pnl)}
                                  </p>
                                  <p className={\\\	ext-xs font-bold \\\\}>
                                     {pnlIsUp ? '+' : ''}{pnlPct.toFixed(2)}%
                                  </p>
                                </div>
                              </div>
                           ) : (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                 <p className="text-xs text-gray-400 font-medium">Tracking only (No position added).</p>
                              </div>
                           )}
                         </div>
                      );
                   })}
                 </div>
              )}\;

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
              )}\;

fs.writeFileSync('src/components/calculators/SwingTrading.tsx', c.replace(tOld, tNew));
console.log('Grid to table replaced');
