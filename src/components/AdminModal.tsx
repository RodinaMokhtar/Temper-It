import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  LogIn, 
  Search, 
  CheckCircle, 
  Clock, 
  Truck, 
  Check, 
  AlertCircle, 
  Download, 
  DollarSign, 
  Settings, 
  RefreshCw,
  Cloud,
  LogOut,
  BarChart3,
  ShoppingBag,
  Bell
} from 'lucide-react';
import { OrderItem } from '../types';
import { AdminAnalytics } from './AdminAnalytics';
import { useToast } from '../context/ToastContext';
import { 
  auth, 
  loginWithGoogle, 
  logout, 
  checkIsAdmin, 
  BOOTSTRAP_ADMIN_EMAIL 
} from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderItem[];
  basePrice: number;
  onUpdateBasePrice: (newPrice: number) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderItem['status']) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  orders,
  basePrice,
  onUpdateBasePrice,
  onUpdateOrderStatus,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemoAuth, setIsDemoAuth] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('123456');
  const [loginError, setLoginError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tempPriceInput, setTempPriceInput] = useState<string>(basePrice.toString());
  const [priceUpdatedToast, setPriceUpdatedToast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics'>('orders');
  const { success, error, info, warning } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setTempPriceInput(basePrice.toString());
  }, [basePrice]);

  if (!isOpen) return null;

  const isUserAuthenticated = isDemoAuth || currentUser !== null;
  const isGoogleAdmin = currentUser ? checkIsAdmin(currentUser) : false;

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password === '123456') {
      setIsDemoAuth(true);
      setLoginError('');
      success('تم تسجيل الدخول بنجاح', 'مرحباً بك في لوحة تحكم Temper-IT (الوضع التجريبي)');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة (جرب admin / 123456)');
      error('فشل تسجيل الدخول', 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setLoginError('');
    try {
      await loginWithGoogle();
      success('تم تسجيل الدخول بنجاح', 'تم تفعيل صلاحيات المشرف السحابية والاتصال بـ Firestore.');
    } catch (err: any) {
      console.error(err);
      setLoginError(err?.message || 'فشل تسجيل الدخول بواسطة Google');
      error('فشل تسجيل الدخول', err?.message || 'تعذر تسجيل الدخول بواسطة Google');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsDemoAuth(false);
    if (currentUser) {
      await logout();
    }
    info('تم تسجيل الخروج', 'تم قفل لوحة التحكم الإدارية بنجاح.');
  };

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(tempPriceInput, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateBasePrice(val);
      setPriceUpdatedToast(true);
      success(
        'تم تحديث وحفظ السعر بنجاح',
        `تم اعتماد سعر ${val.toLocaleString()} ج.م ومزامنته سحابياً لجميع الزوار على الفور.`
      );
      setTimeout(() => setPriceUpdatedToast(false), 2500);
    } else {
      warning('تنبيه السعر', 'يرجى إدخال قيمة سعر رقمية أكبر من الصفر.');
    }
  };

  const handleStatusChange = (orderId: string, orderNumber: string, newStatus: OrderItem['status']) => {
    onUpdateOrderStatus(orderId, newStatus);
    info(
      'تم تحديث حالة الطلب',
      `تم تغيير حالة الطلب #${orderNumber} إلى "${newStatus}" بنجاح ومزامنتها سحابياً.`
    );
  };

  const handleTabSwitch = (tab: 'orders' | 'analytics') => {
    setActiveTab(tab);
    if (tab === 'analytics') {
      info('تفعيل لوحة التحليلات والمبيعات', 'تم تفعيل الرسوم البيانية التفاعلية اللحظية (Recharts) ومؤشرات الأداء.');
    } else {
      info('عرض سجل الطلبات', 'تم الانتقال لجدول إدارة ومتابعة الطلبات المباشرة.');
    }
  };

  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    if (val !== 'all') {
      info('تصفية قائمة الطلبات', `تم تفعيل عرض الطلبات بحالة "${val}" فقط.`);
    } else {
      info('عرض كافة الطلبات', 'تم إلغاء التصفية وعرض جميع الطلبات.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.businessName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['رقم الطلب', 'التاريخ', 'العميل', 'الهاتف', 'المنشأة', 'القطاع', 'المنتج', 'الكمية', 'الإجمالي', 'المحافظة', 'طريقة الدفع', 'الحالة'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt,
      o.customerName,
      o.customerPhone,
      o.businessName,
      o.sector,
      o.productName,
      o.quantity,
      o.totalPrice,
      o.governorate,
      o.paymentMethod,
      o.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `temper_it_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('تم تصدير ملف الطلبات بنجاح', `تم استخراج بيانات ${orders.length} طلب إلى ملف CSV.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full flex flex-col shadow-2xl border border-slate-200 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 text-xl font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900">
                  لوحة تحكم الإدارة ومتابعة طلبات الشراء
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Cloud className="w-3 h-3 text-amber-600" />
                  <span>سحابة Firebase متصلة</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                {isUserAuthenticated 
                  ? currentUser 
                    ? `مرحباً، ${currentUser.displayName || currentUser.email} (مسؤول معتمد)`
                    : 'مرحباً، المشرف العام (جلسة تجريبية)'
                  : 'يرجى تسجيل الدخول للوصول إلى قاعدة بيانات طلبات العملاء'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUserAuthenticated && (
              <button
                onClick={handleSignOut}
                className="text-xs font-bold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full w-9 h-9 flex items-center justify-center transition border border-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {!isUserAuthenticated ? (
            /* Login Form View */
            <div className="max-w-md mx-auto py-6 space-y-6">
              {/* Google Sign In Callout */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 p-5 rounded-3xl text-center space-y-3">
                <span className="text-xs font-bold text-sky-950 block">تسجيل الدخول المعتمد بواسطة حساب Google:</span>
                <p className="text-[11px] text-sky-700 leading-relaxed">
                  يسمح للمسؤولين المعتمدين ({BOOTSTRAP_ADMIN_EMAIL}) بالتحكم المباشر في قاعدة بيانات Firebase وقائمة الطلبات.
                </p>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 px-4 rounded-xl border border-slate-300 shadow-xs hover:shadow transition flex items-center justify-center gap-3 cursor-pointer text-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.67-5.17 3.67-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.12C3.26 21.3 7.37 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.28C.46 8.24 0 10.07 0 12s.46 3.76 1.28 5.39l3.99-3.12z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.28 6.61l3.99 3.12c.95-2.85 3.6-4.98 6.73-4.98z"
                    />
                  </svg>
                  <span>{authLoading ? 'جاري الاتصال...' : 'الدخول السريع بحساب Google'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-[11px] text-slate-400 font-bold">أو الدخول التجريبي</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-[11px] text-slate-600 leading-relaxed">
                <span>اسم المستخدم: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">admin</strong></span>
                <span className="mx-2">·</span>
                <span>كلمة السر: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">123456</strong></span>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المستخدم:
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كلمة المرور:
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                {loginError && (
                  <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>دخول لوحة التحكم</span>
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Dashboard */
            <div className="space-y-6">
              {/* Tab Navigation Buttons */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('orders')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      activeTab === 'orders'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>سجل الطلبات وإدارتها</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        activeTab === 'orders'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {orders.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSwitch('analytics')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>التحليلات والمبيعات (Recharts)</span>
                    <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      جديد
                    </span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>متصل بـ Firestore</span>
                </div>
              </div>

              {/* Toast Feature Interactive Bar */}
              <div className="bg-gradient-to-r from-sky-50/80 via-indigo-50/40 to-slate-50 rounded-2xl p-4 border border-sky-200/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>نظام الإشعارات التفاعلية (Toast Notifications)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        مُفعّل بالكامل
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      إشعارات فورية متجاوبة تظهر عند إرسال الطلبات، وتعديل الأسعار، وتغيير الحالات
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap self-stretch md:self-auto justify-end">
                  <button
                    type="button"
                    onClick={() => success('تم تفعيل الخاصية بنجاح!', 'تم حفظ الإعدادات وتطبيق التغييرات الفورية على النظام.', 4000)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>تجربة إشعار نجاح</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => info('مزامنة سحابية نشطة', 'تم تحديث سجل الطلبات اللحظي من قاعدة بيانات Firestore.', 4000)}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>تجربة معلومة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => warning('تنبيه المتابعة', 'يوجد طلبات جديدة بحاجة للتأكيد عبر محادثات واتساب.', 4000)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>تجربة تنبيه</span>
                  </button>
                </div>
              </div>

              {activeTab === 'analytics' ? (
                <AdminAnalytics orders={orders} />
              ) : (
                <>
                  {/* Quick Config Row: Base Price Adjustment */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">سعر جهاز Temper-IT الأساسي في Firebase</h4>
                    <p className="text-xs text-slate-500">يتزامن السعر لحظياً عبر سحابة Firestore لكافة الزوار والعملاء فور الحفظ</p>
                  </div>
                </div>

                <form onSubmit={handleSavePrice} className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative">
                    <input
                      type="number"
                      step="50"
                      value={tempPriceInput}
                      onChange={(e) => setTempPriceInput(e.target.value)}
                      className="w-32 bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold text-sm focus:outline-none focus:border-sky-500 text-left"
                    />
                    <span className="absolute left-2.5 top-2.5 text-[11px] text-slate-400 font-sans pointer-events-none">
                      ج.م
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    حفظ في السحابة
                  </button>
                  {priceUpdatedToast && (
                    <span className="text-xs text-emerald-600 font-bold animate-fade-in">تم الحفظ!</span>
                  )}
                </form>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث برقم الطلب، اسم العميل، الهاتف، أو المنشأة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-slate-800 focus:outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">كل الحالات ({orders.length})</option>
                    <option value="معلق (بانتظار واتساب)">معلق (بانتظار واتساب)</option>
                    <option value="تم التواصل والتأكيد">تم التواصل والتأكيد</option>
                    <option value="جاري التجهيز والشحن">جاري التجهيز والشحن</option>
                    <option value="تم التسليم بنجاح">تم التسليم بنجاح</option>
                    <option value="ملغي">ملغي</option>
                  </select>

                  <button
                    onClick={exportCSV}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="تصدير بيانات الطلبات كملف Excel / CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير CSV</span>
                  </button>
                </div>
              </div>

              {/* Orders Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">رقم الطلب</th>
                        <th className="p-3.5">العميل والمنشأة</th>
                        <th className="p-3.5">الباقة والكمية</th>
                        <th className="p-3.5">الإجمالي</th>
                        <th className="p-3.5">المحافظة والعنوان</th>
                        <th className="p-3.5">طريقة الدفع</th>
                        <th className="p-3.5">الحالة الحالية</th>
                        <th className="p-3.5 text-center">تحديث الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400">
                            لا توجد طلبات تطابق بحثك حالياً.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                            <td className="p-3.5 font-mono font-bold text-sky-700 whitespace-nowrap">
                              {ord.orderNumber}
                              <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                                {ord.createdAt}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                              <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                                {ord.customerPhone}
                              </span>
                              {ord.businessName && (
                                <span className="block text-[10px] text-slate-400 font-medium">
                                  {ord.businessName} ({ord.sector})
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <span className="font-bold text-slate-800 block">{ord.productName}</span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                الكمية: {ord.quantity}
                              </span>
                            </td>

                            <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {ord.totalPrice.toLocaleString()} ج.م
                            </td>

                            <td className="p-3.5 max-w-[160px] truncate" title={ord.address}>
                              <span className="font-bold text-slate-800 block">{ord.governorate}</span>
                              <span className="text-[10px] text-slate-500 truncate block">
                                {ord.address}
                              </span>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <span className="text-[11px] font-bold text-slate-700">
                                {ord.paymentMethod}
                              </span>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ord.status === 'تم التسليم بنجاح'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : ord.status === 'جاري التجهيز والشحن'
                                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                    : ord.status === 'تم التواصل والتأكيد'
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                    : ord.status === 'ملغي'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>

                            <td className="p-3.5 text-center whitespace-nowrap">
                              <select
                                value={ord.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    ord.id,
                                    ord.orderNumber,
                                    e.target.value as OrderItem['status']
                                  )
                                }
                                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                              >
                                <option value="معلق (بانتظار واتساب)">معلق (بانتظار واتساب)</option>
                                <option value="تم التواصل والتأكيد">تم التواصل والتأكيد</option>
                                <option value="جاري التجهيز والشحن">جاري التجهيز والشحن</option>
                                <option value="تم التسليم بنجاح">تم التسليم بنجاح</option>
                                <option value="ملغي">ملغي</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  </div>
</div>
);
};
