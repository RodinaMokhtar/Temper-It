import React from 'react';
import { ShoppingBag, Eye, MessageSquareText, Zap, Wifi } from 'lucide-react';
import { WHATSAPP_URL, OFFICIAL_CONTROLLER_URL } from '../data/mockData';

interface HeroProps {
  onOrderClick: () => void;
  onLiveDemoClick: () => void;
  basePrice: number;
}

export const Hero: React.FC<HeroProps> = ({ onOrderClick, onLiveDemoClick, basePrice }) => {
  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-sky-50/70 via-sky-50/20 to-transparent">
      {/* Background ambient glow */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 left-10 w-80 h-80 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping"></span>
              <span>حل IoT متكامل لحماية الأدوية، الكواشف والمنتجات الغذائية</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-black text-slate-900 leading-[1.25] tracking-tight">
              احمِ عيناتك ومنتجاتك من التلف بتنبيهات الحرارة{' '}
              <span className="bg-gradient-to-l from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                الفورية
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
              حساس حرارة ذكي متصل بالإنترنت ومخصص للبيوت والمنازل، المستشفيات، بنوك الدم، معامل التحاليل، والصيدليات.
              يراقب درجات الحرارة على مدار 24 ساعة وينبهك فوراً على هاتفك والواتساب عند الخروج عن المدى المسموح أو عند انقطاع الكهرباء.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
              <button
                onClick={onOrderClick}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-base sm:text-lg px-7 py-3.5 rounded-2xl shadow-lg shadow-sky-600/25 hover:shadow-sky-600/35 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>اطلب الجهاز الآن ({basePrice.toLocaleString()} ج.م)</span>
              </button>

              <button
                onClick={onLiveDemoClick}
                className="bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-base sm:text-lg px-6 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Eye className="w-5 h-5 text-sky-600" />
                <span>تجربة النظام الحي</span>
              </button>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-base sm:text-lg px-5 py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
                title="مراسلة سريعة عبر واتساب"
              >
                <MessageSquareText className="w-5 h-5 text-emerald-600" />
                <span>استفسار واتساب</span>
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200/80 text-center lg:text-right">
              <div className="p-2">
                <span className="block text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">24/7</span>
                <span className="text-xs text-slate-500 font-bold">مراقبة مستمرة بلا توقف</span>
              </div>
              <div className="p-2">
                <span className="block text-2xl sm:text-3xl font-black text-sky-600 font-mono tabular-nums">Wi-Fi</span>
                <span className="text-xs text-slate-500 font-bold">ربط سحابي وتنبيهات</span>
              </div>
              <div className="p-2">
                <span className="block text-2xl sm:text-3xl font-black text-emerald-600 font-mono tabular-nums">مباشر</span>
                <span className="text-xs text-slate-500 font-bold">متابعة حية من الهاتف</span>
              </div>
              <div className="p-2">
                <span className="block text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">1,300</span>
                <span className="text-xs text-slate-500 font-bold">ج.م سعر الجهاز الرسمي</span>
              </div>
            </div>
          </div>

          {/* Product Device Visual Showcase (Pure CSS / SVG Industrial IoT Unit) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 p-6 shadow-2xl shadow-slate-900/30 border border-slate-800 text-white">
              {/* Device Chassis Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    TIT
                  </div>
                  <div>
                    <span className="font-mono font-black text-sm tracking-wide text-white block">TEMPER-IT IoT</span>
                    <span className="text-[10px] text-slate-400 font-mono">DIGITAL CONTROLLER</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>متصل بالسحابة</span>
                </div>
              </div>

              {/* Glowing OLED Display Simulation */}
              <div className="my-5 bg-black/90 rounded-2xl p-5 border border-sky-500/30 shadow-inner relative overflow-hidden">
                <div className="flex justify-between items-center text-[11px] text-sky-400/80 font-mono mb-2">
                  <span>ROOM 01 · SMART FRIDGE</span>
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>95%</span>
                  </span>
                </div>

                <div className="text-center py-2">
                  <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    4.2°C
                  </span>
                  <div className="text-[11px] font-mono text-slate-400 mt-2 flex justify-center gap-4">
                    <span>MIN: <strong className="text-sky-400">2.0°C</strong></span>
                    <span>STATUS: <strong className="text-emerald-400">NORMAL</strong></span>
                    <span>MAX: <strong className="text-rose-400">8.0°C</strong></span>
                  </div>
                </div>

                {/* Simulated micro-sparkline */}
                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>DIGITAL SENSOR</span>
                  <span className="text-emerald-400">● 24/7 ACTIVE MONITOR</span>
                </div>
              </div>

              {/* Hardware Diagnostic Ports & Status */}
              <div className="grid grid-cols-3 gap-2.5 p-1 text-center text-xs">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-slate-400 block text-[10px] font-semibold">الشاشة</span>
                  <span className="text-white font-bold text-xs">OLED مدمجة</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-slate-400 block text-[10px] font-semibold">التنبيهات</span>
                  <span className="text-white font-bold text-xs">إشعار فوري</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-slate-400 block text-[10px] font-semibold">الربط</span>
                  <span className="text-emerald-400 font-bold text-xs">Wi-Fi تلقائي</span>
                </div>
              </div>

              {/* Direct Link to Official Control Dashboard */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>الموقع الرسمي للتحكم بالجهاز:</span>
                </div>
                <a
                  href={OFFICIAL_CONTROLLER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 font-bold underline flex items-center gap-1 text-[11px]"
                >
                  <span>لوحة المراقبة الرسمية</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
