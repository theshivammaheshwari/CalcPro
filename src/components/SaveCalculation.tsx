import { useState } from 'react';
import { Bookmark, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SaveCalculation({ calcId, data }: { calcId: string, data: any }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState('');
  const [showInput, setShowInput] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    if (!title) {
      setShowInput(true);
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'saved_calculations'), {
        userId: user.uid,
        calcId,
        title,
        data,
        createdAt: serverTimestamp()
      });
      setSaved(true);
      setShowInput(false);
      setTimeout(() => setSaved(false), 3000);
      setTitle('');
    } catch (err) {
      console.error(err);
      alert('Failed to save calculation. Check your database permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-end mt-4">
      {showInput && (
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <input 
            autoFocus
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Name your calculation (e.g. My Next Trip)" 
            className="px-3 py-1.5 text-sm w-[200px] sm:w-[250px] outline-none rounded-lg"
          />
          <button onClick={() => setShowInput(false)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <button 
        onClick={handleSave}
        disabled={saving || saved}
        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          saved ? 'bg-green-100 text-green-700 border border-green-200' : 
          'bg-gray-900 text-white hover:bg-gray-800 shadow-md'
        }`}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
         saved ? <Check className="w-4 h-4" /> : 
         <Bookmark className="w-4 h-4" />}
        {saved ? 'Saved!' : 'Save Calculation'}
      </button>
    </div>
  );
}
