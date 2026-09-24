import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { OrderItem } from '../types';
import { useToast } from '../context/ToastContext';

interface AdminAnalyticsProps {
  orders: OrderItem[];
}

const SECTOR_COLORS: Record<string, string> = {
  'البيوت': '#0284c7', // Sky
  'معمل تحاليل طبي': '#10b981', // Emerald
  'مستشفى / بنك دم': '#ef4444', // Red
  'صيدلية': '#8b5cf6', // Purple
  'سوبرماركت / بقالة': '#f59e0b', // Amber
  'مخازن أدوية وشحن مبرد': '#06b6d4', // Cyan
  'أخرى': '#64748b', // Slate
};

const STATUS_COLORS: Record<string, string> = {
  'تم التسليم بنجاح': '#10b981',
  'جاري التجهيز والشحن': '#0284c7',
  'تم التواصل والتأكيد': '#6366f1',
  'معلق (بانتظار واتساب)': '#f59e0b',
  'ملغي': '#ef4444',
};

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ orders }) => {
  const [timeRange, setTimeRange] = useState<'all' | '30days' | '7days'>('all');
  const [excludeCancelled, setExcludeCancelled] = useState<boolean>(false);
  const { info } = useToast();

  const handleTimeRangeChange = (range: 'all' | '30days' | '7days') => {
    setTimeRange(range);
    const label = range === '7days' ? 'آخر 7 أيام' : range === '30days' ? 'آخر 30 يوماً' : 'كل الأوقات';
    info('تحديث مدى التحليلات', `تم تفعيل عرض مؤشرات المبيعات لـ: ${label}.`);
  };

  const handleExcludeCancelledChange = (checked: boolean) => {
    setExcludeCancelled(checked);
    if (checked) {
      info('استبعاد الطلبات الملغية', 'تم استبعاد الطلبات الملغية من مجمل الإيرادات ومتوسط قيمة الطلب.');
    } else {
      info('تضمين كافة الحالات', 'تم تضمين جميع الطلبات المسجلة في الحسابات.');
    }
  };

  // Filter orders based on user selection
  const relevantOrders = useMemo(() => {
    let list = [...orders];

    if (excludeCancelled) {
      list = list.filter((o) => o.status !== 'ملغي');
    }

    if (timeRange !== 'all') {
      const now = new Date();
      const cutoffDays = timeRange === '7days' ? 7 : 30;
      const cutoffTime = now.getTime() - cutoffDays * 24 * 60 * 60 * 1000;

      list = list.filter((o) => {
        if (!o.createdAt) return true;
        const parsed = new Date(o.createdAt).getTime();
        return isNaN(parsed) ? true : parsed >= cutoffTime;
      });
    }

    return list;
  }, [orders, timeRange, excludeCancelled]);

  // Key KPI metrics
  const metrics = useMemo(() => {
    const totalOrders = relevantOrders.length;
    const totalRevenue = relevantOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    
    const deliveredOrders = relevantOrders.filter((o) => o.status === 'تم التسليم بنجاح');
    const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    const pendingOrders = relevantOrders.filter(
      (o) => o.status === 'معلق (بانتظار واتساب)' || o.status === 'تم التواصل والتأكيد'
    ).length;

    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders.length / totalOrders) * 100) : 0;

    return {
      totalOrders,
      totalRevenue,
      deliveredRevenue,
      pendingOrders,
      avgOrderValue,
      deliveryRate,
    };
  }, [relevantOrders]);

  // Aggregate orders by Date for time-series charts
  const timeSeriesData = useMemo(() => {
    const dateMap: Record<string, { ordersCount: number; revenue: number; rawDate: Date }> = {};

    relevantOrders.forEach((o) => {
      let dateKey = 'غير محدد';
      let parsedDate = new Date();

      if (o.createdAt) {
        // Try parsing ISO or "YYYY-MM-DD"
        const cleanStr = o.createdAt.trim();
        const d = new Date(cleanStr);
        if (!isNaN(d.getTime())) {
          parsedDate = d;
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          dateKey = `${yyyy}-${mm}-${dd}`;
        } else {
          // Extract date part before space
          const match = cleanStr.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/);
          if (match) {
            dateKey = match[0].replace(/[/.]/g, '-');
          } else {
            dateKey = cleanStr.split(' ')[0] || cleanStr;
          }
        }
      }

      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { ordersCount: 0, revenue: 0, rawDate: parsedDate };
      }

      dateMap[dateKey].ordersCount += 1;
      dateMap[dateKey].revenue += Number(o.totalPrice) || 0;
    });

    // Sort chronologically
    const sorted = Object.entries(dateMap)
      .map(([date, data]) => ({
        date,
        dateLabel: date,
        ordersCount: data.ordersCount,
        revenue: data.revenue,
        rawTime: data.rawDate.getTime(),
      }))
      .sort((a, b) => {
        if (a.date === 'غير محدد') return 1;
        if (b.date === 'غير محدد') return -1;
        return a.date.localeCompare(b.date);
      });

    // Calculate cumulative revenue
    let runningRevenue = 0;
    return sorted.map((item) => {
      runningRevenue += item.revenue;
      return {
        ...item,
        cumulativeRevenue: runningRevenue,
      };
    });
  }, [relevantOrders]);

  // Sector breakdown data
  const sectorData = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    relevantOrders.forEach((o) => {
      const sec = o.sector || 'أخرى';
      if (!counts[sec]) counts[sec] = { count: 0, revenue: 0 };
      counts[sec].count += 1;
      counts[sec].revenue += Number(o.totalPrice) || 0;
    });

    return Object.entries(counts).map(([name, val]) => ({
      name,
      value: val.count,
      revenue: val.revenue,
      color: SECTOR_COLORS[name] || '#94a3b8',
    }));
  }, [relevantOrders]);

  // Status breakdown data
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    relevantOrders.forEach((o) => {
      const st = o.status || 'غير محدد';
      counts[st] = (counts[st] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#94a3b8',
    }));
  }, [relevantOrders]);

  // Payment methods breakdown
  const paymentMethodData = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    relevantOrders.forEach((o) => {
      const pm = o.paymentMethod || 'أخرى';
      if (!counts[pm]) counts[pm] = { count: 0, revenue: 0 };
      counts[pm].count += 1;
      counts[pm].revenue += Number(o.totalPrice) || 0;
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    }));
  }, [relevantOrders]);

  // Custom Tooltip for Time Series Chart
  const CustomTimeSeriesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 text-right min-w-[190px] text-xs">
          <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">التاريخ:</span>
            <span className="font-mono text-slate-900">{label}</span>
          </p>
          <div className="space-y-1.5">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 text-[11px]">{item.name}:</span>
                </div>
                <span className="font-bold font-mono text-slate-900">
                  {item.dataKey === 'revenue' || item.dataKey === 'cumulativeRevenue'
                    ? `${Number(item.value).toLocaleString()} ج.م`
                    : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Header */}
      <div className="bg-gradient-to-r from-sky-50/70 via-indigo-50/40 to-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>تحليلات وإحصائيات المبيعات والإيرادات</span>
              <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                بيانات سحابية مباشرة
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              رسم بياني تفاعلي يوضح وتيرة الطلبات والإيرادات التراكمية عبر الزمن
            </p>
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
          <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => handleTimeRangeChange('all')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                timeRange === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كل الأوقات
            </button>
            <button
              onClick={() => handleTimeRangeChange('30days')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                timeRange === '30days'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              آخر 30 يوماً
            </button>
            <button
              onClick={() => handleTimeRangeChange('7days')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                timeRange === '7days'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              آخر 7 أيام
            </button>
          </div>

          <label className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={excludeCancelled}
              onChange={(e) => handleExcludeCancelledChange(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <span>استبعاد الملغي</span>
          </label>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Gross Revenue */}
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800">إجمالي الإيرادات</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {metrics.totalRevenue.toLocaleString()}
            <span className="text-xs font-bold text-slate-500 font-sans mr-1">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>المحصل منها: {metrics.deliveredRevenue.toLocaleString()} ج.م</span>
          </div>
        </div>

        {/* Total Orders Count */}
        <div className="bg-gradient-to-br from-sky-50 to-white border border-sky-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-800">إجمالي الطلبات</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {metrics.totalOrders}
            <span className="text-xs font-bold text-slate-500 font-sans mr-1">طلب</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>طلبات بانتظار التأكيد: {metrics.pendingOrders}</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-800">متوسط قيمة الطلب</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {metrics.avgOrderValue.toLocaleString()}
            <span className="text-xs font-bold text-slate-500 font-sans mr-1">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>معدل تسليم ناجح: {metrics.deliveryRate}%</span>
          </div>
        </div>

        {/* Real-time sync badge */}
        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">تحديث Firestore</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">بيانات فورية ومزامنة</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              محدث لـ {relevantOrders.length} سجل شراء معتمد
            </p>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>استجابة لحظية لأي طلب جديد</span>
          </div>
        </div>
      </div>

      {/* Main Chart: Orders and Total Revenue Over Time */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <span>مخطط الطلبات والإيرادات عبر الزمن (Recharts)</span>
            </h5>
            <p className="text-xs text-slate-500">
              توزيع المبيعات وقيمة الإيرادات الإجمالية مصنفة بالتواريخ المسجلة
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-sky-600 inline-block"></span>
              <span className="text-slate-600">الإيرادات اليومية (ج.م)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-500 inline-block"></span>
              <span className="text-slate-600">عدد الطلبات</span>
            </div>
          </div>
        </div>

        {timeSeriesData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
            <AlertCircle className="w-8 h-8 mb-2 stroke-[1.5]" />
            <span>لا توجد بيانات كافية خلال الفترة الزمنية المحددة</span>
          </div>
        ) : (
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={timeSeriesData}
                margin={{ top: 10, right: 20, bottom: 20, left: 20 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                {/* Left Axis: Revenue in EGP */}
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  stroke="#0284c7" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                />
                {/* Right Axis: Orders Count */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#6366f1" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTimeSeriesTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => <span className="font-bold text-slate-700">{value}</span>}
                />
                {/* Revenue as shaded Area */}
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  name="الإيرادات (ج.م)" 
                  fill="url(#revenueGradient)" 
                  stroke="#0284c7" 
                  strokeWidth={2.5}
                />
                {/* Cumulative revenue line */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cumulativeRevenue"
                  name="الإيراد التراكمي (ج.م)"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#10b981' }}
                />
                {/* Orders count as Bar */}
                <Bar 
                  yAxisId="right"
                  dataKey="ordersCount" 
                  name="عدد الطلبات" 
                  fill="#6366f1" 
                  radius={[6, 6, 0, 0]} 
                  barSize={20}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Secondary Charts Grid: Sectors & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sector Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <span>توزيع الطلبات حسب القطاع والنشاط</span>
              </h5>
              <p className="text-[11px] text-slate-500">البيوت، المعامل الطبية، الصيدليات وغيرها</p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} طلب (${((Number(value) / metrics.totalOrders) * 100 || 0).toFixed(0)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                    textAlign: 'right',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Sectors Legend list */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
            {sectorData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-slate-700 truncate max-w-[100px]">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status & Payment Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>حالة الطلبات وطرق الدفع</span>
                </h5>
                <p className="text-[11px] text-slate-500">متابعة نسب التنفيذ والتحصيل المالي</p>
              </div>
            </div>

            {/* Status Bars */}
            <div className="space-y-2.5 mb-5">
              <span className="text-xs font-bold text-slate-700 block">حالة الطلبات:</span>
              {statusData.map((st, idx) => {
                const pct = metrics.totalOrders > 0 ? (st.value / metrics.totalOrders) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                        <span className="font-bold text-slate-700">{st.name}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {st.value} طلب ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: st.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Cards */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-2">طرق الدفع المستخدمة:</span>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethodData.map((pm, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/70 p-2 rounded-xl text-xs">
                  <div className="text-slate-600 font-semibold truncate text-[11px]">{pm.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold font-mono text-slate-900">{pm.count} طلب</span>
                    <span className="font-bold font-mono text-emerald-700 text-[10px]">
                      {pm.revenue.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
