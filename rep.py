with open('src/components/calculators/SwingTrading.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
with open('src/components/calculators/SwingTrading.tsx', 'w', encoding='utf-8') as f:
    for line in lines:
        if 'className={lex-grow p-3 border border-gray-200' in line:
            f.write(line.replace('className={lex-grow', 'className={w-full'))
        elif 'onChange={(e) => setCompareInput(e.target.value.toUpperCase())}' in line:
            f.write(line.replace('onChange={(e) => setCompareInput(e.target.value.toUpperCase())}', 'onChange={handleCompareInputChange}onFocus={() => { if(compareInput) setShowCompareSuggestions(true) }}onBlur={() => setTimeout(() => setShowCompareSuggestions(false), 200)}'))
        else:
            f.write(line)
