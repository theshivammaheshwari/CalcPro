import fs from 'fs';
const code = fs.readFileSync('src/components/calculators/SwingTrading.tsx', 'utf8');

const t2 = code.indexOf('<div className="mt-4 pt-4 border-t border-gray-100">');
const t4 = code.indexOf('{/* View: Compare */}');

const fixedStr = \<div className="mt-4 pt-4 border-t border-gray-100">
                                 <p className="text-xs text-gray-400 font-medium">Tracking only (No position added).</p>
                              </div>
                           )}
                         </div>
                      );
                   })}
                 </div>
              )}
            </div>
          )}
        </div>
      )}\;

fs.writeFileSync('src/components/calculators/SwingTrading.tsx', code.substring(0, t2) + fixedStr + '\\n\\n      ' + code.substring(t4));
console.log('Restored wishlist closure');
