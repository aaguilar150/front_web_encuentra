/**
 * Pie de página: mensaje humanitario + canales de contacto (Instagram, TikTok, email).
 */
import React from 'react';
import { Heart, Instagram, Mail, ChevronDown } from 'lucide-react';
import FlagBar from './FlagBar';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <FlagBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex flex-wrap items-center justify-center gap-1.5">
          Hecho con <Heart size={14} className="fill-rose-500 text-rose-500 animate-pulse" /> para el soporte humanitario en Venezuela
        </h3>

        <div className="flex flex-row items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <label htmlFor="language-select" className="font-medium">Idioma:</label>
            <div className="relative">
              <select 
                id="language-select" 
                className="appearance-none bg-transparent font-bold pr-4 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 rounded-sm"
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
              <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <a href="https://instagram.com/Venezuelaencuentra" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors shadow-sm" aria-label="Instagram">
              <Instagram size={15} />
            </a>
            <a href="https://tiktok.com/@venezuelaencuentra" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm" aria-label="TikTok">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.5 3c.3 2.3 1.6 3.9 3.9 4.1v2.7c-1.3.1-2.5-.3-3.9-1.1v5.9c0 3.4-2.5 5.4-5.3 5.4A5.4 5.4 0 0 1 6 14.6c0-3.2 3-5.5 6.1-4.7v2.8c-.5-.2-1-.2-1.5-.1-1.2.2-2 1-1.9 2.3.1 1.2 1 1.9 2.2 1.8 1.2-.1 1.9-1 1.9-2.3V3h2.7Z" />
              </svg>
            </a>
            <a href="mailto:Venezuelaencuentra@gmail.com" className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-700 transition-colors shadow-sm" aria-label="Email">
              <Mail size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
