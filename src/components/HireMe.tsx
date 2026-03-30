import { useState } from "react";
import { ArrowLeft, Send, Mail, Phone, MapPin, Code, Star, Zap } from "lucide-react";

const WHATSAPP_NUMBER = "919468955596";

export default function HireMe({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [toast, setToast] = useState<{ title: string; desc?: string; type: 'success' | 'error' } | null>(null);

  const showToast = (title: string, desc?: string, type: 'success' | 'error' = 'success') => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      showToast("Please fill required fields", "Name and message are required.", "error");
      return;
    }

    const text = `*New Website Inquiry*%0A%0A*Name:* ${form.name}%0A*Email:* ${form.email}%0A*Subject:* ${form.subject}%0A*Message:* ${form.message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");

    showToast("Redirecting to WhatsApp!", "Your message is ready to send.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl transition-all animate-in slide-in-from-top-4 ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          <h4 className="font-bold">{toast.title}</h4>
          {toast.desc && <p className="text-sm opacity-90">{toast.desc}</p>}
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 sm:p-12 mb-10 text-white shadow-2xl shadow-indigo-500/30 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 opacity-20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold uppercase tracking-widest mb-6 border border-white/20">
            <Zap className="w-4 h-4 text-yellow-300" /> Premium Web Development
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            Launch Your Dream Website!
          </h1>
          <p className="text-lg sm:text-xl font-medium opacity-90 mb-8 max-w-2xl">
            Get a stunning, high-performance, and responsive website crafted exactly to your needs. Stand out from the competition.
          </p>
          <div className="inline-block bg-white text-indigo-900 font-black text-2xl sm:text-3xl px-8 py-4 rounded-2xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform">
            Starting at ₹9,000 / $90
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h2>
            <p className="text-gray-500 text-sm">
              This website was developed by <strong className="text-gray-900">Mr. Shivam Maheshwari</strong>. Ready to build yours? Let's talk!
            </p>
          </div>

          <div className="space-y-4">
            <a href="tel:+919468955596" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors group">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Phone</p>
                <p className="font-bold text-gray-900">+91 9468955596</p>
              </div>
            </a>

            <a href="mailto:247shivam@gmail.com" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors group">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email</p>
                <p className="font-bold text-gray-900">247shivam@gmail.com</p>
              </div>
            </a>
          </div>

          <div className="pt-4">
            <p className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Follow on Social Media</p>
            <div className="flex gap-3 flex-wrap">
              {[
                { url: "https://www.youtube.com/@ComputerScienceEngineering", color: 'hover:bg-red-50 hover:text-red-500', icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/> },
                { url: "https://www.instagram.com/shivammaheshwary1", color: 'hover:bg-pink-50 hover:text-pink-500', icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/> },
                { url: "https://www.linkedin.com/in/shivammaheshwary1/", color: 'hover:bg-blue-50 hover:text-blue-600', icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/> },
                { url: "https://www.facebook.com/theshivammaheshwari", color: 'hover:bg-blue-50 hover:text-blue-700', icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
              ].map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer"
                  className={`h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 transition-colors ${social.color}`}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">{social.icon}</svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-xl shadow-gray-200/50">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
            <Code className="w-5 h-5" /> Let's build something amazing
          </div>
          
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Email</label>
              <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white" />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Project Type / Subject</label>
            <input type="text" placeholder="E-commerce, Portfolio, Blog..." value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Message <span className="text-red-500">*</span></label>
            <textarea placeholder="Tell me about your project requirements..." rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white resize-none" />
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 mt-2">
            <Send className="h-5 w-5" />
            Send via WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}
