import React from 'react';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_DISPLAY } from '../data/mockData';

interface FloatingWhatsAppProps {
  onOpenInquiry: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onOpenInquiry }) => {
  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 md:left-6 z-40 flex items-center gap-2 group">
      <button
        onClick={onOpenInquiry}
        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white p-3 sm:px-4 sm:py-3 rounded-full sm:rounded-2xl shadow-xl shadow-emerald-950/25 hover:shadow-emerald-600/40 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 border border-emerald-400/40 cursor-pointer"
        title="تواصل معنا عبر واتساب بيزنس"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-emerald-600 shrink-0" />
        <span className="hidden sm:inline font-black text-xs">
          مراسلة Temper-IT واتساب ({WHATSAPP_DISPLAY})
        </span>
      </button>
    </div>
  );
};
