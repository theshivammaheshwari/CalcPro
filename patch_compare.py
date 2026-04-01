import json

with open('CalcPro/src/components/calculators/SwingTrading.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

old_str = '''          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              type="text"
              value={compareInput}
              onChange={(e) => setCompareInput(e.target.value.toUpperCase())}
              placeholder="e.g. RELIANCE, TCS, INFY"
              className={lex-grow p-3 border border-gray-200 rounded-xl focus:ring-2  focus:border-transparent uppercase transition-all duration-200}
            />
            <button'''

new_str = '''          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex-grow relative">
              <input
                type="text"
                value={compareInput}
                onChange={handleCompareInputChange}
                onFocus={() => { if(compareInput) setShowCompareSuggestions(true) }}
                onBlur={() => setTimeout(() => setShowCompareSuggestions(false), 200)}
                placeholder="e.g. RELIANCE, TCS, INFY"
                className={w-full p-3 border border-gray-200 rounded-xl focus:ring-2  focus:border-transparent uppercase transition-all duration-200}
              />
              {showCompareSuggestions && compareSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto py-1 text-left">
                  {compareSuggestions.map(s => (
                    <li
                      key={s.symbol}
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent blur
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
            </div>
            <button'''

if old_str in c:
    c = c.replace(old_str, new_str)
    with open('CalcPro/src/components/calculators/SwingTrading.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Replaced compareInput JSX correctly.")
else:
    print("Mismatch string")
