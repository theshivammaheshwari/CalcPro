import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Calculator, Trash2, Clock, Play, Bookmark, LogOut, Search } from 'lucide-react';

interface SavedItem {
  id: string;
  calcId: string;
  title: string;
  data: any;
  createdAt: any;
  isLiveTrip?: boolean;
  isAdmin?: boolean;
}

export default function Dashboard({ onLoad }: { onLoad: (calcId: string, data: any) => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const fetchItems = async () => {
      try {
        const qSaves = query(collection(db, 'saved_calculations'), where('userId', '==', user.uid));
        const qTrips = query(collection(db, 'trips'), where('memberUids', 'array-contains', user.uid));
        
        const [snapSaves, snapTrips] = await Promise.all([getDocs(qSaves), getDocs(qTrips)]);
        
        const savesData = snapSaves.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SavedItem[];
        const tripsData = snapTrips.docs.map(doc => {
          const td = doc.data();
          return {
            id: doc.id,
            calcId: 'group-splitter',
            title: td.title || 'Live Trip',
            data: { tripId: doc.id },
            createdAt: td.createdAt,
            isLiveTrip: true,
            isAdmin: td.adminUid === user.uid
          };
        }) as SavedItem[];

        const combined = [...savesData, ...tripsData];
        // Sort manually to avoid Firestore composite index requirement
        combined.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setItems(combined);
      } catch (err) {
        console.error("Error fetching saved items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [user]);

  const handleDelete = async (item: SavedItem) => {
    if (item.isLiveTrip) {
      if (item.isAdmin) {
        if (!window.confirm("Delete this entire Live Trip for EVERYONE?")) return;
        try {
          await deleteDoc(doc(db, 'trips', item.id));
          setItems(items.filter(i => i.id !== item.id));
        } catch (e) { alert("Failed to delete trip."); }
      } else {
        if (!window.confirm("Leave this trip? You will lose access until someone sends you the link again.")) return;
        try {
          await updateDoc(doc(db, 'trips', item.id), {
            memberUids: arrayRemove(user!.uid)
          });
          setItems(items.filter(i => i.id !== item.id));
        } catch (e) { alert("Failed to leave trip."); }
      }
    } else {
      if (!window.confirm("Delete this saved calculation?")) return;
      try {
        await deleteDoc(doc(db, 'saved_calculations', item.id));
        setItems(items.filter(i => i.id !== item.id));
      } catch (err) {
        console.error(err);
        alert("Delete failed.");
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading your saved calculations...</div>;
  }

  if (!user) {
    return (
      <div className="p-12 text-center bg-gray-50 border border-gray-100 border-dashed rounded-3xl">
        <h3 className="text-xl font-bold text-gray-800 mb-1">Please Log In</h3>
        <p className="text-gray-500">Log in to view and manage your saved calculations.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center bg-gray-50 border border-gray-100 border-dashed rounded-3xl">
        <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-800 mb-1">No Saves Yet</h3>
        <p className="text-gray-500">Go to any calculator and click "Save Calculation" to store your data here.</p>
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    const type = item.isLiveTrip ? 'live trip' : item.calcId.replace(/-/g, ' ');
    return item.title.toLowerCase().includes(q) || type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-indigo-600" /> My Saved Calculations
        </h2>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search your saves..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm"
          />
        </div>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 border border-gray-100 border-dashed rounded-3xl">
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Results Found</h3>
          <p className="text-gray-500">No saved calculation matches "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
              <button 
                onClick={() => handleDelete(item)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                title={item.isLiveTrip && !item.isAdmin ? "Leave Trip" : "Delete"}
              >
                {item.isLiveTrip && !item.isAdmin ? <LogOut className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-2 mb-3">
                 <span className={`px-2.5 py-1 ${item.isLiveTrip ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'} text-xs font-bold uppercase tracking-wider rounded-lg`}>
                   {item.isLiveTrip ? 'Live Trip' : item.calcId.replace(/-/g, ' ')}
                 </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate pr-8">{item.title}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-5">
                <Clock className="w-3.5 h-3.5" /> 
                {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Recently'}
              </p>
              <button 
                onClick={() => onLoad(item.calcId, item.data)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> Open & Load Data
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

