import React from 'react';
import { Microscope, Hospital, Home, Store, Pill, Thermometer, Check } from 'lucide-react';
import { SECTORS_DATA } from '../data/mockData';

interface SectorsProps {
  onSelectSectorForOrder: (sectorName: string) => void;
}

export const Sectors: React.FC<SectorsProps> = ({ onSelectSectorForOrder }) => {
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'home':
        return <Home className="w-6 h-6 text-amber-600" />;
      case 'microscope':
        return <Microscope className="w-6 h-6 text-sky-600" />;
      case 'hospital':
        return <Hospital className="w-6 h-6 text-rose-600" />;
      case 'pill':
        return <Pill className="w-6 h-6 text-emerald-600" />;
      case 'store':
      default:
        return <Store className="w-6 h-6 text-indigo-600" />;
    }
  };

  const getBgColor = (icon: string) => {
    switch (icon) {
      case 'home':
        return 'bg-amber-100/80';
      case 'microscope':
        return 'bg-sky-100/80';
      case 'hospital':
        return 'bg-rose-100/80';
      case 'pill':
        return 'bg-emerald-100/80';
      case 'store':
      default:
        return 'bg-indigo-100/80';
    }
  };

  return (
    <section id="sectors" className="py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">القطاعات والتطبيقات</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 mb-4 tracking-tight">
            حل مخصص للبيوت والمؤسسات الصحية والتجارية
          </h2>
          <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
            صُمم نظام Temper-IT ليوفر راحة البال للمنازل وحماية الأدوية الحساسة كالأنسولين، إلى جانب تلبية الاشتراطات الصارمة للمعامل والمستشفيات.
          </p>
        </div>

        {/* Sectors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTORS_DATA.map((sector, index) => (
            <div
              key={index}
              className="bg-slate-50/70 p-6 rounded-3xl border border-slate-200 hover:border-sky-500 hover:shadow-lg transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getBgColor(sector.icon)} group-hover:scale-110 transition-transform duration-200`}>
                    {getIcon(sector.icon)}
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {sector.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2">
                  {sector.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  {sector.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono font-bold">
                  <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                  <span>المدى القياسي:</span>
                  <span className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">{sector.tempRange}</span>
                </div>

                <button
                  onClick={() => onSelectSectorForOrder(sector.title)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 transition cursor-pointer flex items-center gap-1"
                >
                  <span>طلب لهذا النشاط</span>
                  <span>←</span>
                </button>
              </div>
            </div>
          ))}

          {/* Context Card */}
          <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white p-6 rounded-3xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-bold text-sky-400 block mb-2">سلامة المخزون والتفتيش</span>
              <h3 className="text-xl font-black mb-2">تقارير موثقة وسجل تفتيش فوري</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                تطابق تام مع متطلبات المراقبة المستمرة وسلسلة التبريد (Cold Chain) لحفظ الأدوية والأغذية الحساسة.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>تصدير سجل درجات الحرارة والتقارير الدورية</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>إثبات استقرار درجات الحرارة على مدار 24 ساعة</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-800/80 relative z-10 flex items-center justify-between">
              <span className="text-xs text-sky-300 font-mono font-bold">Temper-IT IoT Sensor</span>
              <span className="text-xs bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded-lg border border-sky-500/30">1,300 ج.م</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
