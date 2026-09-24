import React, { useState } from 'react';
import { ShoppingBag, Truck, ShieldCheck, MessageCircle, CreditCard, Banknote, Smartphone, CheckCircle2, Lock, HelpCircle, Share2, Copy, Check } from 'lucide-react';
import { ProductItem, BusinessSector, PaymentMethod, OrderItem } from '../types';
import { EGYPT_GOVERNORATES, WHATSAPP_PHONE, WHATSAPP_URL, WHATSAPP_DISPLAY } from '../data/mockData';
import { useToast } from '../context/ToastContext';

interface CheckoutSectionProps {
  products: ProductItem[];
  selectedProductId: string;
  onProductChange: (id: string) => void;
  selectedSectorFromParent?: string;
  onOrderCreated: (order: OrderItem) => void;
  onOpenPaymentGateway: (order: OrderItem) => void;
  onOpenInquiryModal: () => void;
}

export const CheckoutSection: React.FC<CheckoutSectionProps> = ({
  products,
  selectedProductId,
  onProductChange,
  selectedSectorFromParent,
  onOrderCreated,
  onOpenPaymentGateway,
  onOpenInquiryModal,
}) => {
  const currentProduct = products[0] || {
    id: 'starter',
    name: 'جهاز وحساس Temper-IT الذكي',
    price: 1300,
  };

  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [sector, setSector] = useState<BusinessSector>(
    (selectedSectorFromParent as BusinessSector) || 'البيوت'
  );
  const [governorate, setGovernorate] = useState<string>('القاهرة');
  const [address, setAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('الدفع عند الاستلام (COD)');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedQuickLink, setCopiedQuickLink] = useState<boolean>(false);
  const { success, info } = useToast();

  // Calculate pricing
  const unitPrice = currentProduct.price;
  const totalPrice = unitPrice * quantity;

  const createOrderObject = (): OrderItem => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TIT-2026-${randomSuffix}`;

    return {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customerName: customerName.trim() || 'عميل تجريبي',
      customerPhone: customerPhone.trim() || '010XXXXXXXX',
      businessName: businessName.trim() || 'غير محدد',
      sector,
      productId: currentProduct.id,
      productName: currentProduct.name,
      quantity,
      unitPrice,
      totalPrice,
      governorate,
      address: address.trim() || 'مصر',
      paymentMethod,
      notes,
      status: 'معلق (بانتظار واتساب)',
    };
  };

  const handleSubmitOrder = (e: React.FormEvent, proceedToGateway = false) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newOrder = createOrderObject();

    // Prepare message for WhatsApp Business
    const messageLines = [
      `👋 مرحبًا فريق Temper-IT، أود تأكيد طلب جهاز مراقبة الحرارة الذكي:`,
      `---------------------------------`,
      `📋 رقم الطلب: ${newOrder.orderNumber}`,
      `📦 المنتج: ${currentProduct.name}`,
      `🔢 الكمية: ${quantity} ${quantity > 1 ? 'أجهزة' : 'جهاز'}`,
      `💰 إجمالي السعر: ${totalPrice.toLocaleString()} جنيه مصري`,
      `👤 اسم العميل: ${newOrder.customerName}`,
      `📞 رقم الهاتف / الواتساب: ${newOrder.customerPhone}`,
      `🏥 المنشأة / المكان: ${newOrder.businessName}`,
      `🏷️ القطاع / النشاط: ${sector}`,
      `📍 المحافظة: ${governorate}`,
      `🏠 العنوان التفصيلي: ${newOrder.address}`,
      `💳 طريقة الدفع: ${paymentMethod}`,
      notes.trim() ? `📝 ملاحظات خاصة: ${notes}` : null,
      `---------------------------------`,
      `أرجو تأكيد تجهيز الشحنة وموعد الاستلام. شكراً لكم!`,
    ].filter(Boolean);

    const encodedText = encodeURIComponent(messageLines.join('\n'));
    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;

    // Callback to parent to store order and show receipt modal
    onOrderCreated(newOrder);

    if (proceedToGateway || paymentMethod !== 'الدفع عند الاستلام (COD)') {
      success(
        'تم تسجيل طلبك بنجاح!',
        `رقم الطلب #${newOrder.orderNumber} - جارٍ نقلك لبوابة السداد الإلكتروني المباشر...`,
        5000
      );
      // Open Gateway Modal directly for online payment
      setIsSubmitting(false);
      onOpenPaymentGateway(newOrder);
    } else {
      success(
        'تم تسجيل طلبك بنجاح!',
        `رقم الطلب #${newOrder.orderNumber} - جارٍ فتح محادثة واتساب الرسمية للتأكيد الفوري والشحن...`,
        6000
      );
      // Open WhatsApp Business in new tab/window
      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        setIsSubmitting(false);
      }, 400);
    }
  };

  const handleCopyPaymentLink = () => {
    const url = `${window.location.origin}/#checkout?qty=${quantity}&price=${totalPrice}`;
    navigator.clipboard.writeText(url);
    setCopiedQuickLink(true);
    info('تم نسخ رابط الطلب المباشر', 'تم نسخ رابط الطلب لحافظة جهازك لمشاركته مع فريق العمل أو الإدارة.');
    setTimeout(() => setCopiedQuickLink(false), 2500);
  };

  return (
    <section id="checkout" className="py-20 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Information & Trust Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
              <Truck className="w-3.5 h-3.5" />
              <span>التوصيل والمعاينة متاحين لكافة محافظات مصر</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              اطلب جهاز وحساس Temper-IT الذكي الآن
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm">
              الجهاز يأتي مبرمجاً بالكامل ومجهزاً للربط السحابي فوراً. نعتمد على محادثات واتساب بيزنس الرسمية لخدمتكم والتأكد من ملاءمة الجهاز لاحتياجاتكم خطوة بخطوة.
            </p>

            {/* Conversational Inquiry Callout */}
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-sky-950 block">هل لديك استفسار قبل الشراء؟</span>
                  <span className="text-[11px] text-sky-700">تحدث مع المهندس المختص عبر واتساب بيزنس</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenInquiryModal}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer shrink-0"
              >
                استفسار سريع
              </button>
            </div>

            {/* Step by step startup checkout explanation */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-sky-600" />
                <span>كيف تكتمل دورة الطلب والدفع؟</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ١
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">بدء الاستفسار أو الطلب عبر واتساب:</span>
                    <span>تأكيد تفاصيل التوصيل وسعر الجهاز (1,300 ج.م) والكمية المطلوبة.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ٢
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">بوابة الدفع الإلكتروني المتكاملة:</span>
                    <span>سداد إلكتروني آمن عبر Paymob (فيزا/ميزة)، إنستاباي InstaPay، أو فودافون كاش.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ٣
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">تأكيد المعاملة والشحن الفوري:</span>
                    <span>إرسال إشعار السداد في شات الواتساب وتجهيز الجهاز للشحن مباشرة.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">واتساب بيزنس المعتمد للمبيعات:</span>
                  <span className="text-xs text-emerald-700 font-mono font-bold" dir="ltr">+{WHATSAPP_DISPLAY}</span>
                </div>
              </div>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shrink-0"
              >
                محادثة فورية
              </a>
            </div>
          </div>

          {/* Checkout Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">
                    تسجيل بيانات طلب الشراء
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    سعر الوحدة: <strong className="text-sky-600 font-mono">{unitPrice.toLocaleString()} ج.م</strong> مع التوصيل لكافة المحافظات
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-400 block font-semibold">إجمالي الطلب:</span>
                  <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                    {totalPrice.toLocaleString()}{' '}
                    <span className="text-xs font-sans text-slate-500">ج.م</span>
                  </span>
                </div>
              </div>

              <form onSubmit={(e) => handleSubmitOrder(e, false)} className="space-y-4">
                {/* Single Product & Quantity Row */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      المنتج
                    </label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs sm:text-sm font-bold flex items-center justify-between">
                      <span>{currentProduct.name}</span>
                      <span className="text-sky-700 font-mono">{currentProduct.price.toLocaleString()} ج.م</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الكمية المطلوبة *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:border-sky-500 transition text-center font-mono"
                    />
                  </div>
                </div>

                {/* Customer Name & Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الاسم بالكامل *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: د. أحمد محمود / أ. كريم سامي"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهاتف / الواتساب *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="010XXXXXXXX أو 011XXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Business Name & Sector */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم المنشأة / المكان
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: معمل الشروق / ثلاجة المنزل"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نوع النشاط أو المكان *
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value as BusinessSector)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-500 transition cursor-pointer"
                    >
                      <option value="البيوت">البيوت والمنازل</option>
                      <option value="معمل تحاليل طبي">معمل تحاليل طبي</option>
                      <option value="مستشفى / بنك دم">مستشفى / بنك دم</option>
                      <option value="صيدلية">صيدلية</option>
                      <option value="سوبرماركت / بقالة">سوبرماركت / بقالة</option>
                      <option value="مخازن أدوية وشحن مبرد">مخازن أدوية وشحن مبرد</option>
                      <option value="أخرى">قطاع آخر</option>
                    </select>
                  </div>
                </div>

                {/* Governorate & Detailed Address */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      المحافظة *
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-500 transition cursor-pointer"
                    >
                      {EGYPT_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      العنوان بالتفصيل واسم الشارع *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="المدينة، الشارع، علامة مميزة أو رقم العمارة"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    طريقة الدفع المفضلة *
                  </label>
                  <div className="grid sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('الدفع عند الاستلام (COD)')}
                      className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'الدفع عند الاستلام (COD)'
                          ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        {paymentMethod === 'الدفع عند الاستلام (COD)' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                        )}
                      </div>
                      <span className="text-xs font-bold">الدفع عند الاستلام</span>
                      <span className="text-[10px] text-slate-500">فحص وتجربة الجهاز أولاً</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('إنستاباي (InstaPay)')}
                      className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'إنستاباي (InstaPay)'
                          ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Smartphone className="w-4 h-4 text-purple-600" />
                        {paymentMethod === 'إنستاباي (InstaPay)' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                        )}
                      </div>
                      <span className="text-xs font-bold">إنستاباي (InstaPay)</span>
                      <span className="text-[10px] text-slate-500">تحويل بنكي لحظي</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('فودافون كاش / محفظة ذكية')}
                      className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                        paymentMethod === 'فودافون كاش / محفظة ذكية'
                          ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <CreditCard className="w-4 h-4 text-rose-600" />
                        {paymentMethod === 'فودافون كاش / محفظة ذكية' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                        )}
                      </div>
                      <span className="text-xs font-bold">فودافون كاش / فيزا</span>
                      <span className="text-[10px] text-slate-500">محافظ وبوابة Paymob</span>
                    </button>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ملاحظات إضافية أو ضبط مسبق لدرجات الحرارة (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="مثال: يرجى ضبط النطاق مسبقاً على 2 إلى 8 درجات لحفظ كواشف معمل..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg py-4 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75"
                  >
                    <MessageCircle className="w-5 h-5 text-emerald-100" />
                    <span>
                      {isSubmitting
                        ? 'جاري تجهيز الفاتورة وفتح واتساب...'
                        : `إتمام الطلب عبر واتساب (${totalPrice.toLocaleString()} ج.م)`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSubmitOrder(e, true)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <CreditCard className="w-4 h-4 text-sky-400" />
                    <span>الدفع الفوري الآن عبر بوابة الدفع الإلكتروني (Paymob / InstaPay)</span>
                  </button>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>بيانات مشفرة ومؤكدة عبر واتساب بيزنس</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyPaymentLink}
                      className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedQuickLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                      <span>{copiedQuickLink ? 'تم نسخ الرابط!' : 'نسخ رابط دفع لهذا الطلب'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
