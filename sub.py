import re
with open('src/components/calculators/SwingTrading.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = re.sub(
    r'<input[^>]+onChange=\{handleCompareInputChange\}[^>]+/>',
    r'''<div className="flex-grow relative">\g<0>
              {showCompareSuggestions && compareSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto py-1 text-left">
                  {compareSuggestions.map(s => (
                    <li
                      key={s.symbol}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectCompareSuggestion(s.symbol);
                      }}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{s.symbol}</span>
                        <span className="text-xs text-gray-500">{s.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-400 p-1 bg-gray-50 rounded group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors self-center">{s.exch}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>''',
    c
)

with open('src/components/calculators/SwingTrading.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Success wrapping')
