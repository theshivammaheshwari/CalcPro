import { Instagram, Facebook, Linkedin, Phone, Mail, Calculator } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <div className="p-1.5 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-lg">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">CalcIndia</span>
            </div>
            <p className="text-sm text-gray-500">Built with ❤️ by</p>
            <a
              href="https://linkedin.com/in/theshivammaheshwari"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Mr. Shivam Maheshwari
            </a>
            <p className="text-xs text-gray-400 mt-1">
              Grateful to <a href="https://www.linkedin.com/in/abhishek-jain007/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-500">Mr. Abhishek Jain</a> for suggestions
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+919468955596"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors text-sm text-gray-700 hover:text-indigo-700"
            >
              <Phone className="w-4 h-4" />
              +91 9468955596
            </a>
            <a
              href="mailto:247shivam@gmail.com"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors text-sm text-gray-700 hover:text-indigo-700"
            >
              <Mail className="w-4 h-4" />
              247shivam@gmail.com
            </a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/theshivammaheshwari"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white hover:scale-110 transition-transform shadow-md"
              title="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com/theshivammaheshwari"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:scale-110 transition-transform shadow-md"
              title="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com/in/theshivammaheshwari"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-blue-700 text-white hover:scale-110 transition-transform shadow-md"
              title="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          © 2024 CalcIndia · All calculators are for informational purposes only
        </div>
      </div>
    </footer>
  );
}
