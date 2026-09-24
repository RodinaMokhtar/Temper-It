import React from 'react';
import { ThermometerSnowflake, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { WHATSAPP_URL, WHATSAPP_DISPLAY, OFFICIAL_CONTROLLER_URL } from '../data/mockData';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-12 gap-8 items-center justify-between pb-8 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-3 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-sky-600 to-cyan-400 rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <ThermometerSnowflake className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                Temper-IT
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              الحل الذكي الأول في مصر لمراقبة درجات حرارة الثلاجات في البيوت والمعامل والصيدليات بالإنترنت مع تنبيهات فورية ومتابعة سحابية مستمرة.
            </p>
          </div>

          {/* Quick Links & Controller Link */}
          <div className="md:col-span-6 flex flex-wrap items-center justify-center md:justify-end gap-5 text-xs font-bold text-slate-300">
            <button
              onClick={() => onNavigate('hero')}
              className="hover:text-white transition cursor-pointer"
            >
              الرئيسية
            </button>
            <button
              onClick={() => onNavigate('sectors')}
              className="hover:text-white transition cursor-pointer"
            >
              القطاعات
            </button>
            <button
              onClick={() => onNavigate('live-demo')}
              className="hover:text-white transition cursor-pointer"
            >
              لوحة المراقبة
            </button>
            <button
              onClick={() => onNavigate('checkout')}
              className="hover:text-white transition cursor-pointer"
            >
              طلب الجهاز (1300 ج.م)
            </button>
            <a
              href={OFFICIAL_CONTROLLER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 transition flex items-center gap-1"
            >
              <span>موقع التحكم بعد الشراء</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onOpenAdmin}
              className="text-slate-400 hover:text-white transition cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>دخول الأدمن</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Floating / Direct Touchpoint */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>واتساب بيزنس متاح لاستقبال الطلبات والاستفسارات:</span>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-emerald-400 font-bold hover:underline"
              dir="ltr"
            >
              +{WHATSAPP_DISPLAY}
            </a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} جميع الحقوق محفوظة لنظام Temper-IT. تم التطوير كمنظومة مصرية ذكية.
          </div>
        </div>
      </div>
    </footer>
  );
};
