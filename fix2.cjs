const fs = require('fs');
let c = fs.readFileSync('src/components/calculators/SwingTrading.tsx', 'utf8');
let o1 = c.indexOf('<div className="mt-4 pt-4 border-t border-gray-100">');
let o2 = c.indexOf('{/* View: Compare */}');

c = c.substring(0, o1) + <div className="mt-4 pt-4 border-t border-gray-100">
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
      )}

       + c.substring(o2);
fs.writeFileSync('src/components/calculators/SwingTrading.tsx', c);
console.log('Fixed wishlist closure');
