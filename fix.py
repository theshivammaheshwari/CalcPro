import json

with open('src/components/calculators/SwingTrading.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

o1 = c.find('<div className="mt-4 pt-4 border-t border-gray-100">')
o2 = c.find('{/* View: Compare */}')

fixed = '''<div className="mt-4 pt-4 border-t border-gray-100">
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

      '''

c = c[:o1] + fixed + c[o2:]

with open('src/components/calculators/SwingTrading.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Fixed wishlist closure')
