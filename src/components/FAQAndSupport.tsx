import React, { useState } from 'react';
import { ChevronDown, MessageCircle, HelpCircle, CheckCircle2, Wrench } from 'lucide-react';
import { FAQS, WHATSAPP_URL, WHATSAPP_DISPLAY } from '../data/mockData';

export const FAQAndSupport: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* FAQ Column */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">
                الأسئلة الشائعة
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-1 mb-2">
                كل ما تحتاج معرفته عن Temper-IT
              </h2>
              <p className="text-slate-600 text-sm">
                إجابات تفصيلية لمساعدتك في اتخاذ قرار حماية ثلاجاتك في البيوت والمعامل والمنشآت.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 bg-slate-50/50"
                  >
                    <button
                      onClick={() => toggle(idx)}
                      className="w-full p-4 sm:p-5 text-right font-bold text-sm text-slate-900 flex justify-between items-center gap-3 cursor-pointer hover:bg-slate-50"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-sky-600' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Support Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white p-7 rounded-3xl border border-slate-800 shadow-xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-black mb-1">
                  لديك استفسار خاص بنشاطك؟
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  فريقنا جاهز لمساعدتك في تشغيل الحساس وتأكيد إعدادات درجات الحرارة المناسبة لمنشأتك أو ثلاجتك المنزلية.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تواصل عبر واتساب ({WHATSAPP_DISPLAY})</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>ربط سحابي فوري ومباشر</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>دعم فني استرشادي مجاني</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
