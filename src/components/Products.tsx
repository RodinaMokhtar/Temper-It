import React, { useState } from 'react';
import { 
  Check, 
  ShoppingBag, 
  Sparkles, 
  Wifi, 
  ShieldCheck, 
  Cpu, 
  Smartphone, 
  ArrowLeft,
  Truck,
  RotateCcw,
  Clock
} from 'lucide-react';
import { ProductItem } from '../types';

interface ProductsProps {
  products: ProductItem[];
  onSelectProduct: (productId: string) => void;
}

export const Products: React.FC<ProductsProps> = ({ products, onSelectProduct }) => {
  const [selectedKits, setSelectedKits] = useState<'single' | 'multi'>('single');

  const mainProduct = products[0] || {
    id: 'starter',
    name: 'جهاز وحساس Temper-IT الذكي',
    tag: 'المنتج الرسمي المعتمد',
    price: 1300,
    description: 'الحل المتكامل المعتمد لمراقبة درجات حرارة الثلاجات والمبردات مع شاشة OLED رقمية مدمجة وتنبيهات فورية وربط سحابي مباشر.',
    features: [
      'جهاز Temper-IT ذكي مزود بشاشة رقمية مدمجة للقراءات',
      'تنبيهات فورية على الهاتف عند أي تغير غير آمن في درجة الحرارة',
      'اتصال مباشر بشبكة الواي فاي للربط السحابي التلقائي',
      'وصول مجاني ودائم للوحة التحكم السحابية واستعراض الرسوم البيانية',
      'إمكانية تحديد درجات الحرارة المستهدفة والتنبيهات المخصصة',
    ],
  };

  return (
    <section id="products" className="py-12 sm:py-16 lg:py-20 bg-slate-100/70 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-3 border border-sky-200">
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
            <span>المواصفات والعتاد المبرمج</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            جهاز وحساس Temper-IT الذكي
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2.5">
            منتج متكامل ومبرمج بأحدث التقنيات للتشغيل الفوري فور التوصيل لحماية الثلاجات في البيوت والمعامل والمنشآت مع كفالة ودعم فني مستمر.
          </p>
        </div>

        {/* Mobile-Optimized Grid Card */}
        <div className="bg-white rounded-3xl border border-sky-500/30 ring-1 ring-sky-500/20 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
          
          {/* Visual Showcase: Stacks neatly on top on mobile, sits side-by-side on desktop */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-6 sm:p-8 flex flex-col justify-between text-white relative min-h-[260px] sm:min-h-[320px]">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar Status */}
            <div className="flex justify-between items-center text-xs relative z-10">
              <span className="font-mono text-xs text-sky-400 font-black tracking-wider">
                TEMPER-IT SENSOR V2
              </span>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2.5 py-0.5 rounded-full border border-sky-500/40 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>متصل سحابياً</span>
              </span>
            </div>

            {/* Centered Device Screen Mockup */}
            <div className="text-center py-6 sm:py-8 my-auto relative z-10">
              <div className="inline-flex flex-col items-center justify-center bg-black/75 px-6 py-4 rounded-3xl border border-sky-500/40 shadow-[0_0_30px_rgba(2,132,199,0.25)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-mono text-2xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                    4.2°C
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
                  Normal Range (Safe)
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-[11px] font-mono mt-3">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                <span>WiFi Connected · Live Telemetry</span>
              </div>
            </div>

            {/* Bottom Spec Tags */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] text-slate-300 font-mono border-t border-slate-800/80 pt-3 relative z-10">
              <div className="bg-slate-800/50 py-1 px-2 rounded-lg border border-slate-700/40">
                OLED SCREEN
              </div>
              <div className="bg-slate-800/50 py-1 px-2 rounded-lg border border-slate-700/40">
                PRO SENSOR
              </div>
              <div className="bg-slate-800/50 py-1 px-2 rounded-lg border border-slate-700/40">
                CLOUD SYNC
              </div>
            </div>
          </div>

          {/* Details & Specs & Mobile-Friendly CTA */}
          <div className="lg:col-span-7 p-5 sm:p-7 lg:p-8 flex flex-col justify-between bg-white">
            <div className="space-y-4 sm:space-y-5">
              {/* Badge & Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-100 flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>المنتج الرسمي المعتمد</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  شامل وحدة التحكم والمستشعر الدقيق
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1.5 leading-snug">
                  {mainProduct.name}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {mainProduct.description}
                </p>
              </div>

              {/* Price Banner Card (Responsive Grid layout on mobile) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-50/70 to-slate-50 border border-sky-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="text-xs text-slate-500 font-bold block">سعر الجهاز الرسمي:</span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    شامل الحساس والبرمجة والربط السحابي الدائم
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 self-end sm:self-auto">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
                    {mainProduct.price.toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-sky-700">جنيه مصري</span>
                </div>
              </div>

              {/* Responsive Grid for Features (Stacks nicely on phones) */}
              <div>
                <span className="font-bold text-slate-900 block text-xs mb-2.5">
                  ما يتضمنه الجهاز والخدمة:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {mainProduct.features.map((feat, fIdx) => (
                    <div 
                      key={fIdx} 
                      className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60"
                    >
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-snug text-[11px] sm:text-xs font-medium text-slate-800">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Indicators for mobile users */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[10px] sm:text-xs text-slate-500">
                <div className="flex items-center gap-1.5 justify-center py-1">
                  <Truck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>شحن لكافة المحافظات</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center py-1 border-x border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ضمان استبدال معتمد</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center py-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>جاهز للتشغيل فوراً</span>
                </div>
              </div>
            </div>

            {/* Mobile-Prominent Checkout CTA Button */}
            <div className="mt-5 pt-3">
              <button
                type="button"
                onClick={() => onSelectProduct(mainProduct.id)}
                className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 cursor-pointer bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 transform active:scale-[0.99]"
              >
                <ShoppingBag className="w-5 h-5 shrink-0 stroke-[2.2]" />
                <span>طلب جهاز Temper-IT الآن ({mainProduct.price.toLocaleString()} ج.م)</span>
                <ArrowLeft className="w-4 h-4 shrink-0 stroke-[2.5] mr-1 hidden sm:inline" />
              </button>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400 font-medium">
                  خيارات دفع متعددة: الدفع عند الاستلام، إنستاباي، فيزا، أو فودافون كاش
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
