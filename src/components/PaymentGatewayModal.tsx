import React, { useState } from 'react';
import { CreditCard, Smartphone, Banknote, ShieldCheck, CheckCircle2, Lock, ArrowLeft, Loader2, Copy, Check, MessageCircle, AlertCircle } from 'lucide-react';
import { OrderItem, PaymentMethod } from '../types';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '../data/mockData';
import { useToast } from '../context/ToastContext';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  order: OrderItem | null;
  onClose: () => void;
  onPaymentSuccess: (orderId: string, txnId: string, method: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  order,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<'paymob_card' | 'instapay' | 'vodafone_cash' | 'cod'>('paymob_card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [txnId, setTxnId] = useState<string>('');
  
  // Card form state
  const [cardNumber, setCardNumber] = useState<string>('4000 1234 5678 9010');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('789');
  const [cardHolder, setCardHolder] = useState<string>(order?.customerName || 'د. أحمد محمود');

  // InstaPay & Wallet state
  const [instaPayRef, setInstaPayRef] = useState<string>('');
  const [walletPhone, setWalletPhone] = useState<string>(order?.customerPhone || '01012345678');
  const [walletOtp, setWalletOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const { success, info } = useToast();

  if (!isOpen || !order) return null;

  const totalAmount = order.totalPrice;

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const generatedTxn = `PMOB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      setTxnId(generatedTxn);
      
      let methodLabel = 'بطاقة بنكية (Paymob)';
      if (selectedGateway === 'instapay') methodLabel = 'إنستاباي (InstaPay)';
      if (selectedGateway === 'vodafone_cash') methodLabel = 'فودافون كاش';
      if (selectedGateway === 'cod') methodLabel = 'الدفع عند الاستلام';

      success(
        'تم تأكيد السداد الإلكتروني بنجاح!',
        `تم تسجيل العملية رقم ${generatedTxn} بقيمة ${totalAmount.toLocaleString()} ج.م وتحديث حالة الطلب.`,
        6000
      );

      onPaymentSuccess(order.id, generatedTxn, methodLabel);
    }, 1400);
  };

  const handleSendPaymentProofToWhatsApp = () => {
    const message = [
      `✅ مرحبًا فريق Temper-IT، تم سداد قيمة طلب الجهاز بنجاح:`,
      `---------------------------------`,
      `📋 رقم الطلب: ${order.orderNumber}`,
      `💳 رقم العملية / المرجع: ${txnId}`,
      `💰 المبلغ المدفوع: ${totalAmount.toLocaleString()} جنيه مصري`,
      `📦 المنتج: ${order.productName} (الكمية: ${order.quantity})`,
      `👤 العميل: ${order.customerName}`,
      `🏥 المنشأة: ${order.businessName}`,
      `📍 العنوان: ${order.governorate} - ${order.address}`,
      `---------------------------------`,
      `برجاء تأكيد استلام الحوالة وتحديد موعد تسليم الجهاز. شكراً لكم!`,
    ].join('\n');

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                بوابة الدفع الإلكتروني المعتمدة (Paymob)
              </h3>
              <p className="text-[11px] text-slate-500">
                ربط مباشر للمعاملات التي تبدأ عبر واتساب بيزنس
              </p>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              إلغاء
            </button>
          )}
        </div>

        {/* Order Quick Summary Header */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between mb-5 text-xs">
          <div>
            <span className="text-slate-500 font-bold block">رقم طلب الشراء:</span>
            <span className="font-mono font-black text-sky-700">{order.orderNumber}</span>
          </div>
          <div className="text-left">
            <span className="text-slate-500 font-bold block">المبلغ المطلوب:</span>
            <span className="text-base font-black text-slate-900 font-mono tabular-nums">
              {totalAmount.toLocaleString()} <span className="text-xs font-sans text-slate-500">ج.م</span>
            </span>
          </div>
        </div>

        {!isCompleted ? (
          <div>
            {/* Gateway Methods Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl mb-5 text-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedGateway('paymob_card')}
                className={`py-2 px-1 rounded-lg transition cursor-pointer ${
                  selectedGateway === 'paymob_card'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>فيزا / ميزة</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGateway('instapay')}
                className={`py-2 px-1 rounded-lg transition cursor-pointer ${
                  selectedGateway === 'instapay'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>InstaPay</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGateway('vodafone_cash')}
                className={`py-2 px-1 rounded-lg transition cursor-pointer ${
                  selectedGateway === 'vodafone_cash'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>فودافون كاش</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGateway('cod')}
                className={`py-2 px-1 rounded-lg transition cursor-pointer ${
                  selectedGateway === 'cod'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>عند الاستلام</span>
              </button>
            </div>

            {/* Payment Sub-Forms */}
            <form onSubmit={handleSimulatePayment} className="space-y-4">
              {selectedGateway === 'paymob_card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      اسم حامل البطاقة:
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      رقم البطاقة (Visa / Mastercard / Meeza):
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono text-left"
                        dir="ltr"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        تاريخ الانتهاء (MM/YY):
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        رمز الأمان (CVV):
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedGateway === 'instapay' && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 text-xs space-y-3">
                  <div className="flex items-start gap-2 text-purple-900">
                    <Smartphone className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">عنوان الدفع اللحظي (IPA Handle):</span>
                      <strong className="font-mono text-purple-800 text-sm select-all">temperit@instapay</strong>
                      <span className="block text-[11px] text-purple-700 mt-1">أو عبر رقم الهاتف المسجل: <strong>01150902000</strong></span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      رقم العملية المرجعي من تطبيق إنستاباي:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: REF-9832104"
                      value={instaPayRef}
                      onChange={(e) => setInstaPayRef(e.target.value)}
                      required
                      className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600 font-mono"
                    />
                  </div>
                </div>
              )}

              {selectedGateway === 'vodafone_cash' && (
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 text-xs space-y-3">
                  <span className="font-bold text-rose-900 block">الدفع عبر محفظة فودافون كاش / أورنج / إتصالات</span>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      رقم المحفظة الإلكترونية:
                    </label>
                    <input
                      type="tel"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      required
                      className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-mono text-left"
                      dir="ltr"
                    />
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={() => setOtpSent(true)}
                      className="text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 py-1.5 px-3 rounded-lg transition"
                    >
                      إرسال كود التأكيد (OTP)
                    </button>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        أدخل كود التأكيد المستلم:
                      </label>
                      <input
                        type="text"
                        value={walletOtp}
                        onChange={(e) => setWalletOtp(e.target.value)}
                        placeholder="123456"
                        required
                        className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-mono text-center"
                      />
                    </div>
                  )}
                </div>
              )}

              {selectedGateway === 'cod' && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2 text-emerald-950">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>الدفع نقداً عند استلام الجهاز ومعاينته</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    يقوم مندوب الشحن بتسليم الجهاز لك مع تجربة تشغيله ومعاينته، ثم سداد مبلغ{' '}
                    <strong>{totalAmount.toLocaleString()} ج.م</strong> نقداً واستلام إيصال الشراء الرسمي.
                  </p>
                </div>
              )}

              {/* Submit Payment Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black text-sm py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري معالجة المعاملة وتأكيد الدفع...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        تأكيد سداد المبلغ ({totalAmount.toLocaleString()} ج.م)
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-slate-400">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>معاملة مشفرة 256-bit ومتوافقة مع معايير البنك المركزي المصري (CBE)</span>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Payment Success State */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                تم استلام الدفعة وتأكيد العملية
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                شكراً لك! تم اعتماد سداد الطلب بنجاح
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                رقم المعاملة البنكية:{' '}
                <strong className="font-mono text-sky-700 font-bold">{txnId}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-slate-500">رقم طلب الشراء:</span>
                <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المبلغ المدفوع:</span>
                <span className="font-mono font-bold text-slate-900">{totalAmount.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">طريقة السداد:</span>
                <span className="font-bold text-slate-800">{order.paymentMethod}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleSendPaymentProofToWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال إشعار السداد فوراً إلى واتساب بيزنس</span>
              </button>

              <button
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                إغلاق والعودة للمتجر
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
