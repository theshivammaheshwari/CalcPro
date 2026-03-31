import { useState } from 'react';
import { Bookmark, Loader2, Check, X, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function SaveCalculation({ calcId, data }: { calcId: string, data: any }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [exportingParams, setExportingParams] = useState(false);

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

  const downloadPDF = async () => {
    const el = document.getElementById('calculator-content');
    if (!el) return;
    setExportingParams(true);
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // Top margin

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`CalcIndia_${calcId.replace(/-/g, '_')}_Report.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF");
    } finally {
      setExportingParams(false);
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
        onClick={downloadPDF}
        disabled={exportingParams}
        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100 shadow-sm disabled:opacity-50"
      >
        {exportingParams ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {exportingParams ? 'PDF...' : 'Download PDF'}
      </button>
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
