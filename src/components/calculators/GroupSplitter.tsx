import { useState, useEffect } from 'react';
import { PlusCircle, Receipt, Users, Wallet, ArrowRight, Pencil, Trash2, X, UserPlus, Home, User, Users2, Share2, ShieldAlert, Check, Link, KeyRound, Loader2 } from 'lucide-react';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, arrayUnion, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import SaveCalculation from '../SaveCalculation';

interface Expense { id: string; payer: string; item: string; amount: number; sharedAmong: string[]; addedByUid?: string; }
interface IndividualData { paid: number; commonShare: number; exclusiveShare: number; totalShare: number; netAmount: number; }
interface TripPerson { name: string; claimUid: string | null; }

export default function GroupSplitter({ initialData, initialTripId }: { initialData?: any; initialTripId?: string | null }) {
  const { user, loginWithGoogle } = useAuth();
  
  // Trip Sync State
  const [tripId, setTripId] = useState<string | null>(initialTripId || null);
  const [adminUid, setAdminUid] = useState<string | null>(null);
  const [title, setTitle] = useState(initialData?.title ?? 'My Group Trip');
  
  // Application State
  const [people, setPeople] = useState<TripPerson[]>(initialData?.people?.map((p: string) => ({ name: p, claimUid: null })) ?? []);
  const [expenses, setExpenses] = useState<Expense[]>(initialData?.expenses ?? []);
  const [families, setFamilies] = useState<Record<string, string[]>>(initialData?.families ?? {});
  const [familyHeads, setFamilyHeads] = useState<Record<string, string>>(initialData?.familyHeads ?? {});
  
  // UI State
  const [loading, setLoading] = useState(!!initialTripId);
  const [activeTab, setActiveTab] = useState<'people' | 'expense' | 'summary'>('people');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [passcode, setPasscode] = useState<string>('');
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Input State
  const [newName, setNewName] = useState('');
  const [payer, setPayer] = useState('');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [fHead, setFHead] = useState('');
  const [fMembers, setFMembers] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Identity logic
  const isLive = !!tripId;
  const isAdmin = user && adminUid === user.uid;
  const myPerson = people.find(p => p.claimUid === user?.uid);
  const iAmJoined = !!myPerson;

  // Real-time listener
  useEffect(() => {
    if (!tripId) return;
    const unsub = onSnapshot(doc(db, 'trips', tripId), (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        setAdminUid(d.adminUid);
        setTitle(d.title || 'Untitled Trip');
        setPasscode(d.passcode || '');
        setPeople(d.people || []);
        setExpenses(d.expenses || []);
        setFamilies(d.families || {});
        setFamilyHeads(d.familyHeads || {});
        setLoading(false);
      } else {
        alert("Trip not found or deleted.");
        setLoading(false);
      }
    });
    return () => unsub();
  }, [tripId]);

  // Evaluate "Claim Profile" necessity
  useEffect(() => {
    if (isLive && user && !loading) {
      const hasClaimed = people.some(p => p.claimUid === user.uid);
      setShowClaimModal(!hasClaimed);
    } else {
      setShowClaimModal(false);
    }
  }, [isLive, user, people, loading]);

  // Database actions
  const pullUpdate = async (updates: any) => {
    if (isLive) await updateDoc(doc(db, 'trips', tripId), updates);
  };

  const createLiveTrip = async () => {
    if (!user) return loginWithGoogle();
    if (people.length === 0) return alert("Please add at least one person first.");
    setSavingTrip(true);
    const newId = 'tr_' + Math.random().toString(36).substr(2, 9);
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const docData = {
      adminUid: user.uid,
      title,
      passcode: code,
      memberUids: [user.uid],
      people,
      expenses,
      families,
      familyHeads,
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db, 'trips', newId), docData);
    const url = new URL(window.location.href);
    url.searchParams.set('tripId', newId);
    window.history.pushState({}, '', url.toString());
    setTripId(newId);
    setSavingTrip(false);
  };

  const claimProfile = async (targetName: string) => {
    if (!user || !isLive) return;
    const mapped = people.map(p => p.name === targetName ? { ...p, claimUid: user.uid } : p);
    await pullUpdate({ people: mapped, memberUids: arrayUnion(user.uid) });
  };

  const joinWithCode = async () => {
    if (!joinCode.trim() || !user) {
        if (!user) loginWithGoogle();
        return;
    }
    setJoining(true);
    try {
        const q = query(collection(db, 'trips'), where('passcode', '==', joinCode.trim().toUpperCase()));
        const snap = await getDocs(q);
        if (snap.empty) {
            alert("Invalid or expired Passcode!");
            setJoining(false); return;
        }
        const foundId = snap.docs[0].id;
        const url = new URL(window.location.href);
        url.searchParams.set('tripId', foundId);
        window.history.pushState({}, '', url.toString());
        setTripId(foundId);
        setShowJoinModal(false);
    } catch { alert("Error joining trip."); }
    setJoining(false);
  };

  // Interaction handlers
  const canEdit = isLive ? (isAdmin || iAmJoined) : true;
  
  const addPerson = async () => {
    const n = newName.trim();
    if (!n || people.some(p => p.name === n)) return;
    const updated = [...people, { name: n, claimUid: null }];
    if (isLive) await pullUpdate({ people: updated });
    else setPeople(updated);
    setNewName('');
  };

  const addFamily = async () => {
    const h = fHead.trim();
    const mems = fMembers.split(',').map(m => m.trim()).filter(m => m && people.some(p => p.name === m));
    if (!h || mems.length === 0 || !people.some(p => p.name === h)) return;
    
    const newFam = { ...families, [h]: mems };
    const newHeads = { ...familyHeads, ...mems.reduce((a, m) => ({ ...a, [m]: h }), {}) };
    
    if (isLive) await pullUpdate({ families: newFam, familyHeads: newHeads });
    else { setFamilies(newFam); setFamilyHeads(newHeads); }
    setFHead(''); setFMembers('');
  };

  const addExpense = async () => {
    if (!payer || !item || !amount || selectedUsers.length === 0) return;
    const e: Expense = { 
      id: editingId || Math.random().toString(36).substr(2, 9),
      payer, item, amount: parseFloat(amount), 
      sharedAmong: [...selectedUsers], 
      addedByUid: editingId ? (expenses.find(x => x.id === editingId)?.addedByUid) : user?.uid 
    };
    
    let updated;
    if (editingId) {
      updated = expenses.map(x => x.id === editingId ? e : x);
      setEditingId(null);
    } else {
      updated = [...expenses, e];
    }
    
    if (isLive) await pullUpdate({ expenses: updated });
    else setExpenses(updated);
    
    setPayer(isLive && myPerson ? myPerson.name : ''); setItem(''); setAmount(''); setSelectedUsers([]);
  };

  const startEdit = (e: Expense) => {
    setPayer(e.payer); setItem(e.item); setAmount(e.amount.toString()); setSelectedUsers(e.sharedAmong);
    setEditingId(e.id); setActiveTab('expense');
  };

  const delExpense = async (id: string) => {
    const updated = expenses.filter(x => x.id !== id);
    if (isLive) await pullUpdate({ expenses: updated });
    else setExpenses(updated);
  };

  const removePerson = async (n: string) => {
    const updated = people.filter(x => x.name !== n);
    if (isLive) await pullUpdate({ people: updated });
    else setPeople(updated);
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Math Setup
  const calcExpenses = (): Record<string, IndividualData> => {
    const d: Record<string, IndividualData> = {};
    people.forEach(p => { d[p.name] = { paid: 0, commonShare: 0, exclusiveShare: 0, totalShare: 0, netAmount: 0 }; });
    expenses.forEach(({ payer, amount, sharedAmong }) => {
      if (d[payer]) d[payer].paid += amount;
      if (sharedAmong.length === 1 && d[sharedAmong[0]]) {
        d[sharedAmong[0]].exclusiveShare += amount;
      } else { 
        const sp = amount / sharedAmong.length; 
        sharedAmong.forEach(u => { if (d[u]) d[u].commonShare += sp; }); 
      }
    });
    people.forEach(p => {
      d[p.name].totalShare = d[p.name].commonShare + d[p.name].exclusiveShare;
      d[p.name].netAmount = d[p.name].paid - d[p.name].totalShare;
    });
    return d;
  };

  const calcSettlements = (balances: Record<string, number>) => {
    const settlements: { from: string; to: string; amount: number }[] = [];
    let debtors = Object.entries(balances).filter(([, a]) => a < -0.01).map(([n, a]) => ({ name: n, amount: Math.abs(a) })).sort((a, b) => b.amount - a.amount);
    let creditors = Object.entries(balances).filter(([, a]) => a > 0.01).map(([n, a]) => ({ name: n, amount: a })).sort((a, b) => b.amount - a.amount);
    
    while (debtors.length && creditors.length) {
      const d = debtors[0], c = creditors[0];
      const sa = Math.min(d.amount, c.amount);
      if (sa >= 0.01) settlements.push({ from: d.name, to: c.name, amount: Number(sa.toFixed(2)) });
      d.amount -= sa; c.amount -= sa;
      if (d.amount < 0.01) debtors.shift();
      if (c.amount < 0.01) creditors.shift();
    }
    return settlements;
  };

  const indData = calcExpenses();
  const indSettlements = calcSettlements(Object.fromEntries(people.map(p => [p.name, indData[p.name]?.netAmount ?? 0])));

  const familyBalances: Record<string, number> = {};
  people.forEach(p => {
    const n = p.name;
    const head = familyHeads[n];
    const isHead = families[n];
    if (head) { familyBalances[head] = (familyBalances[head] ?? 0) + indData[n].netAmount; }
    else if (isHead) { familyBalances[n] = (familyBalances[n] ?? 0) + indData[n].netAmount; }
    else { familyBalances[n] = indData[n].netAmount; }
  });
  const familySettlements = calcSettlements(familyBalances);
  const maxAmt = Math.max(...people.map(p => Math.abs(indData[p.name]?.netAmount ?? 0)), 1);

  if (loading) return <div className="p-10 text-center animate-pulse text-sky-600 font-bold">Connecting to Live Trip...</div>;

  return (
    <div className="space-y-6 relative">
      {/* Real-time Claim Modal */}
      {showClaimModal && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8 max-w-sm w-full text-center">
            <ShieldAlert className="w-12 h-12 text-sky-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Trip!</h2>
            <p className="text-gray-500 mb-6 text-sm">Welcome to <strong className="text-gray-900">{title}</strong>. Who are you in this group?</p>
            <div className="space-y-2">
              {people.filter(p => !p.claimUid).map(p => (
                <button key={p.name} onClick={() => claimProfile(p.name)} className="w-full py-3 bg-gray-50 hover:bg-sky-50 hover:text-sky-700 text-gray-800 font-semibold rounded-xl border border-gray-100 transition-colors">
                  I am {p.name}
                </button>
              ))}
              {people.filter(p => !p.claimUid).length === 0 && (
                <p className="text-sm text-red-500 font-medium">No empty names left! Tell the Admin to add your name.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && !isLive && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8 max-w-sm w-full text-center">
            <KeyRound className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join a Trip</h2>
            <p className="text-gray-500 mb-6 text-sm">Enter the 6-character passcode shared by your friend to join their trip.</p>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} placeholder="e.g. A1B2C3" className="w-full text-center font-mono text-2xl tracking-[0.2em] font-bold text-indigo-700 bg-indigo-50 border-2 border-indigo-100 rounded-xl p-3 mb-4 outline-none focus:border-indigo-400 uppercase" />
            <div className="flex gap-2">
               <button onClick={() => setShowJoinModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
               <button onClick={joinWithCode} disabled={joining || joinCode.length < 4} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex justify-center items-center">
                 {joining ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Join Trip'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <div>
          {isLive ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
          ) : (
             <input value={title} onChange={e => setTitle(e.target.value)} className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-sky-500 outline-none px-1 py-0.5 transition-colors" placeholder="Trip Title" />
          )}
          {isLive && <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1 font-semibold">{isAdmin ? '👑 You are Admin' : `👤 You are ${myPerson?.name || 'Observer'}`}</p>}
        </div>

        {isLive ? (
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-600">
               <KeyRound className="w-4 h-4 text-gray-400" /> {passcode}
            </div>
            <button onClick={shareLink} className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 font-bold text-sm rounded-xl transition-colors">
              {copiedUrl ? <><Check className="w-4 h-4"/> Copied!</> : <><Share2 className="w-4 h-4"/> Share Invite</>}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button onClick={createLiveTrip} disabled={savingTrip} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm rounded-xl hover:shadow-lg shadow-sky-500/30 transition-all">
               <Link className="w-4 h-4" /> Create Live Invite
            </button>
            <button onClick={() => setShowJoinModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all">
               <KeyRound className="w-4 h-4" /> Join via Passcode
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {['people', 'expense', 'summary'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t ? 'bg-sky-100 text-sky-700' : 'text-gray-500 hover:bg-gray-100'}`}>
             {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* People Tab */}
      {activeTab === 'people' && (
        <div className="space-y-6">
          <div className="bg-sky-50 rounded-2xl p-5">
            <h3 className="font-semibold text-sky-800 flex items-center gap-2 mb-3"><Users className="w-5 h-5" /> Trip Members</h3>
            {canEdit && (!isLive || isAdmin) && (
              <div className="flex gap-2 mb-4">
                <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPerson()} placeholder="Enter name" className="calc-input flex-1" />
                <button onClick={addPerson} className="p-2.5 bg-sky-600 text-white rounded-xl"><PlusCircle className="w-5 h-5" /></button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {people.map(p => (
                <span key={p.name} className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 border font-medium ${p.claimUid ? 'bg-sky-500 text-white border-sky-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200'} `}>
                  {p.name}
                  {p.claimUid === user?.uid && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full ml-1">You</span>}
                  {canEdit && (!isLive || isAdmin) && (
                    <button onClick={() => removePerson(p.name)} className="ml-1 opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-2xl p-5">
            <h3 className="font-semibold text-purple-800 flex items-center gap-2 mb-3"><Home className="w-5 h-5" /> Family Groups</h3>
            {canEdit && (!isLive || isAdmin) && (
              <div className="space-y-3 mb-4">
                <input value={fHead} onChange={e => setFHead(e.target.value)} placeholder="Family Head Name" className="calc-input" />
                <input value={fMembers} onChange={e => setFMembers(e.target.value)} placeholder="Members (comma-separated)" className="calc-input" />
                <button onClick={addFamily} className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-semibold">Create Family</button>
              </div>
            )}
            <div className="space-y-2">
              {Object.entries(families).map(([head, members]) => (
                <div key={head} className="bg-white p-3 rounded-xl flex gap-2 items-start text-sm">
                  <UserPlus className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div><span className="font-bold text-gray-800">{head}'s Family: </span><span className="text-gray-600">{members.join(', ')}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expense Tab */}
      {activeTab === 'expense' && (
        <div className="space-y-4">
          {canEdit && (
            <div className="bg-green-50 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-green-800 flex items-center gap-2"><Receipt className="w-5 h-5" /> {editingId ? 'Edit' : 'Add'} Expense</h3>
              <select value={payer} onChange={e => setPayer(e.target.value)} className="calc-input">
                <option value="">Who Paid?</option>
                {people.map(p => <option key={p.name} value={p.name} disabled={isLive && !isAdmin && p.name !== myPerson?.name}>{p.name}{p.name === myPerson?.name ? ' (You)' : ''}</option>)}
              </select>
              <input type="text" placeholder="What for? (e.g. Dinner)" value={item} onChange={e => setItem(e.target.value)} className="calc-input" />
              <input type="number" placeholder="₹ Amount" value={amount} onChange={e => setAmount(e.target.value)} className="calc-input" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Split Among</p>
                <div className="flex flex-wrap gap-2">
                  {people.map(p => (
                    <label key={p.name} className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${selectedUsers.includes(p.name) ? 'bg-green-500 text-white font-semibold' : 'bg-white border text-gray-600'}`}>
                      <input type="checkbox" className="hidden" checked={selectedUsers.includes(p.name)} onChange={() => setSelectedUsers(prev => prev.includes(p.name) ? prev.filter(u => u !== p.name) : [...prev, p.name])} />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={addExpense} className="w-full py-2.5 bg-green-600 text-white rounded-xl font-bold">{editingId ? 'Save Edits' : 'Add Expense'}</button>
            </div>
          )}

          {expenses.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full calc-table">
                <thead><tr><th>Payer</th><th>Item</th><th>Amount</th><th>For</th>{canEdit && <th></th>}</tr></thead>
                <tbody>
                  {expenses.map((e) => {
                    const canModify = !isLive || isAdmin || e.addedByUid === user?.uid;
                    return (
                    <tr key={e.id}>
                      <td className="font-medium text-gray-900">{e.payer}</td>
                      <td className="text-gray-600">{e.item}</td>
                      <td className="font-bold text-green-700">₹{e.amount}</td>
                      <td><div className="flex flex-wrap gap-1">{e.sharedAmong.map(u => <span key={u} className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600">{u}</span>)}</div></td>
                      {canEdit && (
                        <td>
                          {canModify && (
                            <div className="flex gap-2">
                              <button onClick={() => startEdit(e)} className="text-blue-500"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => delExpense(e.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4"><Wallet className="w-5 h-5 text-sky-600" /> Balances</h3>
            {people.map(p => (
              <div key={p.name} className="mb-3">
                <div className="flex justify-between text-sm items-center mb-1">
                  <span className="font-medium text-gray-700">
                    {p.name} {p.name === myPerson?.name && '(You)'}
                  </span>
                  <span className={`font-bold ${(indData[p.name]?.netAmount ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(indData[p.name]?.netAmount ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${(indData[p.name]?.netAmount ?? 0) >= 0 ? 'bg-green-400' : 'bg-red-400'}`} style={{ width: `${(Math.abs(indData[p.name]?.netAmount ?? 0) / maxAmt) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold mb-3">Settle Up (Individual)</h3>
              {indSettlements.length > 0 ? indSettlements.map((s, i) => (
                <div key={i} className="flex justify-between bg-orange-50 text-orange-700 p-3 rounded-xl mb-2 text-sm font-medium">
                  <div className="flex items-center gap-2"><span>{s.from}</span><ArrowRight className="w-3 h-3 text-orange-400"/><span>{s.to}</span></div>
                  <span className="font-bold">₹{s.amount.toFixed(2)}</span>
                </div>
              )) : <p className="text-sm text-gray-500 text-center py-2">All settled!</p>}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold mb-3">Family Settlement</h3>
              {familySettlements.length > 0 ? familySettlements.map((s, i) => (
                <div key={i} className="flex justify-between bg-purple-50 text-purple-700 p-3 rounded-xl mb-2 text-sm font-medium">
                  <div className="flex items-center gap-2"><span>{s.from}</span><ArrowRight className="w-3 h-3 text-purple-400"/><span>{s.to}</span></div>
                  <span className="font-bold">₹{s.amount.toFixed(2)}</span>
                </div>
              )) : <p className="text-sm text-gray-500 text-center py-2">All settled!</p>}
            </div>
          </div>
        </div>
      )}

      {/* Legacy Save override for personal log */}
      {!isLive && <SaveCalculation calcId="group-splitter" data={{ people: people.map(p=>p.name), expenses, families, familyHeads }} />}
    </div>
  );
}
