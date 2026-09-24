import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, ShoppingBag, HelpCircle, FileText } from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '../data/mockData';
import { useToast } from '../context/ToastContext';

interface WhatsAppInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectOrderClick: () => void;
  basePrice: number;
}

export const WhatsAppInquiryModal: React.FC<WhatsAppInquiryModalProps> = ({
  isOpen,
  onClose,
  onDirectOrderClick,
  basePrice,
}) => {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [customClientName, setCustomClientName] = useState<string>('');
  const [customSector, setCustomSector] = useState<string>('البيوت والمنازل');
  const { success } = useToast();

  if (!isOpen) return null;

  const inquiryTemplates = [
    {
      title: 'طلب شراء فوري ومباشر (1,300 ج.م)',
      badge: 'الأسرع تنفيذاً',
      icon: ShoppingBag,
      getMessage: (name: string, sector: string) =>
        `👋 مرحبًا فريق Temper-IT، أود شراء جهاز مراقبة الحرارة الذكي (${basePrice.toLocaleString()} ج.م).${
          name ? `\nالاسم: ${name}` : ''
        }\nالمكان / النشاط: ${sector}\nأرجو إرسال رابط الدفع وتأكيد بيانات الشحن. شكراً لكم!`,
    },
    {
      title: 'استفسار عام عن طريقة عمل الجهاز والتشغيل',
      badge: 'معلومات عامة',
      icon: HelpCircle,
      getMessage: (name: string, sector: string) =>
        `مرحبًا Temper-IT، أود الاستفسار عن جهاز مراقبة الحرارة الذكي (${basePrice.toLocaleString()} ج.م): كيف يتم وضعه داخل الثلاجة، وهل يحتاج خطوات معقدة لربط الواي فاي؟${
          name ? `\nمعكم: ${name}` : ''
        }`,
    },
    {
      title: 'استفسار عن حماية انقطاع الكهرباء وإشعار التنبيه',
      badge: 'الأمان والتنبيهات',
      icon: Sparkles,
      getMessage: (name: string, sector: string) =>
        `مرحبًا، أريد التأكد من كيفية تنبيه جهاز Temper-IT لي في حالة انقطاع الكهرباء أو الواي فاي عن ثلاجة ${sector}، وهل التنبيه يصل عبر الهاتف؟${
          name ? `\nالاسم: ${name}` : ''
        }`,
    },
    {
      title: 'طلب تفاصيل إضافية أو طلب أكثر من جهاز',
      badge: 'طلب مباشر',
      icon: FileText,
      getMessage: (name: string, sector: string) =>
        `مرحبًا فريق مبيعات Temper-IT، أود الاستفسار عن إمكانية طلب أجهزة Temper-IT لمنشأتنا (${sector}) ومعرفة مواعيد التوصيل والاستلام.${
          name ? `\nالمسؤول: ${name}` : ''
        }`,
    },
  ];

  const handleSendToWhatsApp = (idx: number) => {
    const template = inquiryTemplates[idx];
    const text = template.getMessage(customClientName.trim(), customSector);
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
    success('جارٍ فتح واتساب بيزنس', 'تم تجهيز نص الاستفسار الفوري وتوجيهك لمحادثة الدعم الفني.');
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-13 h-13 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/15">
            <MessageCircle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            تواصل مع فريق Temper-IT على واتساب بيزنس
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            الرقم المعتمد: <strong className="font-mono text-emerald-700" dir="ltr">+{WHATSAPP_DISPLAY}</strong>
          </p>
        </div>

        {/* Optional Customizer Fields */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-5 text-xs space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                اسمك أو اسم المنشأة (اختياري):
              </label>
              <input
                type="text"
                placeholder="د. أحمد / ثلاجة البيت"
                value={customClientName}
                onChange={(e) => setCustomClientName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                المكان / النشاط:
              </label>
              <select
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-sky-500 font-semibold cursor-pointer"
              >
                <option value="البيوت والمنازل">البيوت والمنازل</option>
                <option value="معمل تحاليل طبي">معمل تحاليل طبي</option>
                <option value="مستشفى / بنك دم">مستشفى / بنك دم</option>
                <option value="صيدلية">صيدلية</option>
                <option value="سوبرماركت / بقالة">سوبرماركت / بقالة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
          </div>
        </div>

        {/* Templates Picker */}
        <div className="space-y-2.5 mb-6">
          <span className="text-xs font-bold text-slate-700 block">
            اختر نوع الرسالة أو الاستفسار الجاهز:
          </span>

          {inquiryTemplates.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = selectedTemplateIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => setSelectedTemplateIndex(idx)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{item.title}</span>
                      <span className="text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.getMessage(customClientName, customSector)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleSendToWhatsApp(selectedTemplateIndex)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>إرسال الرسالة المختارة عبر واتساب بيزنس</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onDirectOrderClick();
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
            <span>الانتقال مباشرة إلى نموذج الشراء والدفع السريع (1,300 ج.م)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
