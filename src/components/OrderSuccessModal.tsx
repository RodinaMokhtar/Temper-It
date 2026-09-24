import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, Printer, X, Shield, ArrowRight } from 'lucide-react';
import { OrderItem } from '../types';
import { WHATSAPP_PHONE } from '../data/mockData';

interface OrderSuccessModalProps {
  order: OrderItem | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!order) return null;

  const orderTextSummary = `
طلب جديد: Temper-IT
رقم الطلب: ${order.orderNumber}
المنتج: ${order.productName} (عدد: ${order.quantity})
الإجمالي: ${order.totalPrice.toLocaleString()} ج.م
العميل: ${order.customerName} - ${order.customerPhone}
المنشأة: ${order.businessName} (${order.sector})
العنوان: ${order.governorate} - ${order.address}
طريقة الدفع: ${order.paymentMethod}
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(orderTextSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const encodedText = encodeURIComponent(orderTextSummary);
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            تم تسجيل الطلب بنجاح
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            شكراً لثقتكم بنظام Temper-IT!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            رقم الطلب المرجعي الخاص بك هو:{' '}
            <strong className="font-mono text-sky-700 font-bold text-base">{order.orderNumber}</strong>
          </p>
        </div>

        {/* Invoice Summary Box */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 mb-6 text-xs space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-bold">المنتج المحجوز:</span>
            <span className="font-black text-slate-800">{order.productName} ({order.quantity} أجهزة)</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-bold">طريقة الدفع:</span>
            <span className="font-bold text-slate-800">{order.paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-bold">عنوان التوصيل:</span>
            <span className="font-bold text-slate-800">{order.governorate} - {order.address}</span>
          </div>

          <div className="flex justify-between items-center pt-1 text-sm font-black">
            <span className="text-slate-900">المبلغ الإجمالي المستحق:</span>
            <span className="text-sky-700 font-mono text-base tabular-nums">
              {order.totalPrice.toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <MessageCircle className="w-5 h-5" />
            <span>فتح المحادثة على واتساب بيزنس الآن</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCopy}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الفاتورة'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة إيصال الطلب</span>
            </button>
          </div>
        </div>

        {/* Security & Support Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>متاح فحص وتجربة الجهاز عند الاستلام مع دعم فني استرشادي للتشغيل</span>
        </div>
      </div>
    </div>
  );
};
