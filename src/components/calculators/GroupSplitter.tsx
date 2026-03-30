import { useState } from 'react';
import { PlusCircle, Receipt, Users, Wallet, ArrowRight, Pencil, Trash2, X, UserPlus, Home, User, Users2 } from 'lucide-react';

interface Expense { payer: string; item: string; amount: number; sharedAmong: string[]; }
interface IndividualData { paid: number; commonShare: number; exclusiveShare: number; totalShare: number; netAmount: number; }

export default function GroupSplitter() {
  const [people, setPeople] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payer, setPayer] = useState('');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'people' | 'expense' | 'summary'>('people');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [families, setFamilies] = useState<Record<string, string[]>>({});
  const [familyHeads, setFamilyHeads] = useState<Record<string, string>>({});
  const [fHead, setFHead] = useState('');
  const [fMembers, setFMembers] = useState('');
  const [newName, setNewName] = useState('');

  const addPerson = () => {
    const n = newName.trim();
    if (n && !people.includes(n)) { setPeople(p => [...p, n]); setNewName(''); }
  };

  const addFamily = () => {
    const h = fHead.trim();
    const mems = fMembers.split(',').map(m => m.trim()).filter(m => m && people.includes(m));
    if (h && mems.length > 0 && people.includes(h)) {
      setFamilies(p => ({ ...p, [h]: mems }));
      setFamilyHeads(p => ({ ...p, ...mems.reduce((a, m) => ({ ...a, [m]: h }), {}) }));
      setFHead(''); setFMembers('');
    }
  };

  const addExpense = () => {
    if (!payer || !item || !amount || selectedUsers.length === 0) return;
    const e: Expense = { payer, item, amount: parseFloat(amount), sharedAmong: [...selectedUsers] };
    if (editingIdx !== null) {
      const ne = [...expenses]; ne[editingIdx] = e; setExpenses(ne); setEditingIdx(null);
    } else {
      setExpenses(p => [...p, e]);
    }
    setPayer(''); setItem(''); setAmount(''); setSelectedUsers([]);
  };

  const startEdit = (i: number) => {
    const e = expenses[i];
    setPayer(e.payer); setItem(e.item); setAmount(e.amount.toString()); setSelectedUsers(e.sharedAmong);
    setEditingIdx(i); setActiveTab('expense');
  };

  const calcExpenses = (): Record<string, IndividualData> => {
    const d: Record<string, IndividualData> = {};
    people.forEach(p => { d[p] = { paid: 0, commonShare: 0, exclusiveShare: 0, totalShare: 0, netAmount: 0 }; });
    expenses.forEach(({ payer, amount, sharedAmong }) => {
      d[payer].paid += amount;
      if (sharedAmong.length === 1) d[sharedAmong[0]].exclusiveShare += amount;
      else { const sp = amount / sharedAmong.length; sharedAmong.forEach(u => { d[u].commonShare += sp; }); }
    });
    people.forEach(p => {
      d[p].totalShare = d[p].commonShare + d[p].exclusiveShare;
      d[p].netAmount = d[p].paid - d[p].totalShare;
    });
    return d;
  };

  const calcSettlements = (balances: Record<string, number>) => {
    type S = { from: string; to: string; amount: number };
    const settlements: S[] = [];
    let debtors = Object.entries(balances).filter(([, a]) => a < 0).map(([p, a]) => ({ name: p, amount: Math.abs(a) })).sort((a, b) => b.amount - a.amount);
    let creditors = Object.entries(balances).filter(([, a]) => a > 0).map(([p, a]) => ({ name: p, amount: a })).sort((a, b) => b.amount - a.amount);
    while (debtors.length && creditors.length) {
      const d = debtors[0], c = creditors[0];
      const sa = Math.min(d.amount, c.amount);
      if (sa >= 0.01) settlements.push({ from: d.name, to: c.name, amount: Number(sa.toFixed(2)) });
      d.amount = Number((d.amount - sa).toFixed(2));
      c.amount = Number((c.amount - sa).toFixed(2));
      if (d.amount < 0.01) debtors.shift();
      if (c.amount < 0.01) creditors.shift();
    }
    return settlements;
  };

  const indData = calcExpenses();
  const indSettlements = calcSettlements(Object.fromEntries(people.map(p => [p, indData[p]?.netAmount ?? 0])));

  const familyBalances: Record<string, number> = {};
  people.forEach(p => {
    const head = familyHeads[p];
    const isHead = families[p];
    if (head) { familyBalances[head] = (familyBalances[head] ?? 0) + indData[p].netAmount; }
    else if (isHead) { familyBalances[p] = (familyBalances[p] ?? 0) + indData[p].netAmount; }
    else { familyBalances[p] = indData[p].netAmount; }
  });
  const familySettlements = calcSettlements(familyBalances);

  const maxAmt = Math.max(...people.map(p => Math.abs(indData[p]?.netAmount ?? 0)), 1);
  const isFamilyHead = (p: string) => Boolean(families[p]);

  const tabs = [
    { id: 'people' as const, label: 'People', icon: <Users className="w-4 h-4" /> },
    { id: 'expense' as const, label: editingIdx !== null ? 'Edit Expense' : 'Expense', icon: <Receipt className="w-4 h-4" /> },
    { id: 'summary' as const, label: 'Summary', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Tab nav */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === t.id ? 'bg-sky-100 text-sky-700' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Add People */}
      {activeTab === 'people' && (
        <div className="space-y-6">
          <div className="bg-sky-50 rounded-2xl p-5">
            <h3 className="font-semibold text-sky-800 flex items-center gap-2 mb-3"><Users className="w-5 h-5" /> Add People</h3>
            <div className="flex gap-2 mb-3">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPerson()}
                placeholder="Enter name" className="calc-input flex-1" />
              <button onClick={addPerson} className="p-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors">
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {people.map(p => (
                <span key={p} className="bg-white border border-sky-200 text-sky-800 px-3 py-1 rounded-full text-sm flex items-center gap-1.5">
                  {p}
                  <button onClick={() => setPeople(prev => prev.filter(x => x !== p))} className="text-sky-400 hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Family groups */}
          <div className="bg-purple-50 rounded-2xl p-5">
            <h3 className="font-semibold text-purple-800 flex items-center gap-2 mb-3"><Home className="w-5 h-5" /> Create Family Group</h3>
            <div className="space-y-3">
              <input value={fHead} onChange={e => setFHead(e.target.value)} placeholder="Family Head Name" className="calc-input" />
              <input value={fMembers} onChange={e => setFMembers(e.target.value)} placeholder="Members (comma-separated)" className="calc-input" />
              <button onClick={addFamily} className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                Create Family Group
              </button>
            </div>
            <div className="space-y-2 mt-3">
              {Object.entries(families).map(([head, members]) => (
                <div key={head} className="bg-white p-3 rounded-xl flex gap-2 items-start">
                  <UserPlus className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-purple-700">{head}'s Family: </span>
                    {members.map(m => (
                      <span key={m} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs mr-1">{m}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Expense */}
      {activeTab === 'expense' && (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-green-800 flex items-center gap-2"><Receipt className="w-5 h-5" /> {editingIdx !== null ? 'Edit Expense' : 'Add Expense'}</h3>
              {editingIdx !== null && (
                <button onClick={() => { setPayer(''); setItem(''); setAmount(''); setSelectedUsers([]); setEditingIdx(null); }} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <select value={payer} onChange={e => setPayer(e.target.value)} className="calc-input">
              <option value="">Select Payer</option>
              {people.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" placeholder="Item description" value={item} onChange={e => setItem(e.target.value)} className="calc-input" />
            <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} className="calc-input" />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Split Among</p>
              <div className="flex flex-wrap gap-2">
                {people.map(p => (
                  <label key={p} className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedUsers.includes(p) ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
                  }`}>
                    <input type="checkbox" className="hidden" checked={selectedUsers.includes(p)}
                      onChange={() => setSelectedUsers(prev => prev.includes(p) ? prev.filter(u => u !== p) : [...prev, p])} />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <button onClick={addExpense} className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-md shadow-green-200">
              {editingIdx !== null ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>

          {/* Expense list */}
          {expenses.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full calc-table">
                <thead><tr><th>Payer</th><th>Item</th><th>Amount</th><th>Shared</th><th></th></tr></thead>
                <tbody>
                  {expenses.map((e, i) => (
                    <tr key={i}>
                      <td className="font-medium">{e.payer}</td>
                      <td>{e.item}</td>
                      <td className="font-semibold text-green-700">₹{e.amount.toFixed(2)}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {e.sharedAmong.map(u => <span key={u} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{u}</span>)}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(i)} className="text-blue-400 hover:text-blue-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setExpenses(p => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-5">
          {/* Individual balance bars */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4"><Wallet className="w-5 h-5 text-sky-600" /> Balance Overview</h3>
            {people.map(p => (
              <div key={p} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {p}
                    {isFamilyHead(p) && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Family Head</span>}
                    {familyHeads[p] && <span className="ml-2 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{familyHeads[p]}'s family</span>}
                  </span>
                  <span className={`text-sm font-bold ${(indData[p]?.netAmount ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(indData[p]?.netAmount ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${(indData[p]?.netAmount ?? 0) >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                    style={{ width: `${(Math.abs(indData[p]?.netAmount ?? 0) / maxAmt) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed table */}
          {people.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-800">Detailed Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full calc-table">
                  <thead><tr><th>Name</th><th>Paid</th><th>Common Share</th><th>Exclusive</th><th>Total Share</th><th>Net</th></tr></thead>
                  <tbody>
                    {people.map(p => (
                      <tr key={p}>
                        <td className="font-medium">
                          {p}
                          {isFamilyHead(p) && <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Head</span>}
                        </td>
                        <td>₹{(indData[p]?.paid ?? 0).toFixed(2)}</td>
                        <td>₹{(indData[p]?.commonShare ?? 0).toFixed(2)}</td>
                        <td>₹{(indData[p]?.exclusiveShare ?? 0).toFixed(2)}</td>
                        <td>₹{(indData[p]?.totalShare ?? 0).toFixed(2)}</td>
                        <td className={`font-bold ${(indData[p]?.netAmount ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{(indData[p]?.netAmount ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settlement plans */}
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: 'Individual Settlement', icon: <User className="w-5 h-5 text-orange-500" />, settlements: indSettlements, color: 'bg-orange-50 text-orange-700', arrowColor: 'text-orange-400' },
              { title: 'Family Settlement', icon: <Users2 className="w-5 h-5 text-purple-500" />, settlements: familySettlements, color: 'bg-purple-50 text-purple-700', arrowColor: 'text-purple-400', badge: 'Family Consolidated' },
            ].map(({ title, icon, settlements, color, arrowColor, badge }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  {icon}
                  <h3 className="font-semibold text-gray-800">{title}</h3>
                  {badge && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{badge}</span>}
                </div>
                <div className="space-y-2">
                  {settlements.length > 0 ? settlements.map((s, i) => (
                    <div key={i} className={`flex justify-between items-center p-3 rounded-xl ${color}`}>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span>{s.from}</span>
                        <ArrowRight className={`w-4 h-4 ${arrowColor}`} />
                        <span>{s.to}</span>
                      </div>
                      <span className="font-bold">₹{s.amount.toFixed(2)}</span>
                    </div>
                  )) : (
                    <p className="text-center text-gray-400 py-4 text-sm">✅ No settlements needed!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
