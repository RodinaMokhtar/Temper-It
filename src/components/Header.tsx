import React from 'react';
import { ThermometerSnowflake, ShieldCheck, MessageCircle } from 'lucide-react';
import { WHATSAPP_URL } from '../data/mockData';

interface HeaderProps {
  onOpenAdmin: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenInquiry?: () => void;
  ordersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onNavigate, onOpenInquiry, ordersCount = 0 }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 glassmorphism transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Brand Wordmark */}
          <div 
            onClick={() => onNavigate('hero')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-sky-600 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform duration-200">
              <ThermometerSnowflake className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-sky-700 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                Temper-IT
              </span>
              <span className="block text-xs text-slate-500 font-bold">
                نظام المراقبة والتنبيه الذكي
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 font-bold text-slate-600 text-sm">
            <button
              onClick={() => onNavigate('hero')}
              className="hover:text-sky-600 transition-colors py-1 cursor-pointer"
            >
              الرئيسية
            </button>
            <button
              onClick={() => onNavigate('sectors')}
              className="hover:text-sky-600 transition-colors py-1 cursor-pointer"
            >
              القطاعات المستهدفة
            </button>
            <button
              onClick={() => onNavigate('live-demo')}
              className="hover:text-sky-600 transition-colors py-1 flex items-center gap-1.5 cursor-pointer text-slate-700"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              لوحة المراقبة الحية
            </button>
            <button
              onClick={() => onNavigate('products')}
              className="hover:text-sky-600 transition-colors py-1 cursor-pointer"
            >
              الأجهزة والأسعار
            </button>
            <button
              onClick={() => onNavigate('checkout')}
              className="text-sky-700 hover:text-sky-900 transition-colors py-1 font-extrabold cursor-pointer"
            >
              طلب الجهاز (1,300 ج.م)
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {onOpenInquiry ? (
              <button
                onClick={onOpenInquiry}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all hover:shadow-emerald-600/20 cursor-pointer"
                title="استفسار أو طلب عبر واتساب بيزنس"
              >
                <MessageCircle className="w-4 h-4 text-emerald-100" />
                <span className="hidden sm:inline">واتساب بيزنس</span>
                <span className="sm:hidden">واتساب</span>
              </button>
            ) : (
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all hover:shadow-emerald-600/20"
                title="تواصل مباشر عبر واتساب بيزنس"
              >
                <MessageCircle className="w-4 h-4 text-emerald-100" />
                <span className="hidden sm:inline">واتساب بيزنس</span>
                <span className="sm:hidden">واتساب</span>
              </a>
            )}

            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-800 transition shadow-sm relative cursor-pointer"
              title="لوحة تحكم الطلبات والإدارة"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">دخول الأدمن</span>
              {ordersCount > 0 && (
                <span className="bg-sky-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {ordersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
