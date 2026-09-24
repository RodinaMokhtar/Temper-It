import React, { useState, useEffect, useRef } from 'react';
import { Sliders, AlertTriangle, Flame, Snowflake, Power, RotateCcw, Activity, Wifi, Zap, Cloud, ExternalLink, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { SensorStatus } from '../types';
import { OFFICIAL_CONTROLLER_URL } from '../data/mockData';

export const LiveSimulator: React.FC = () => {
  const [minTemp, setMinTemp] = useState<number>(2.0);
  const [maxTemp, setMaxTemp] = useState<number>(8.0);
  const [tempInputMin, setTempInputMin] = useState<string>('2.0');
  const [tempInputMax, setTempInputMax] = useState<string>('8.0');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [rangeSavedToast, setRangeSavedToast] = useState<boolean>(false);

  const [sensor, setSensor] = useState<SensorStatus>({
    temperature: 4.2,
    targetMin: 2.0,
    targetMax: 8.0,
    powerStatus: 'مستقرة (220V)',
    wifiStrength: 95,
    cloudSync: 'متصل (Active)',
    alertType: 'none',
    isOnline: true,
  });

  const [history, setHistory] = useState<{ time: string; temp: number }[]>([
    { time: '12:00', temp: 4.1 },
    { time: '12:01', temp: 4.2 },
    { time: '12:02', temp: 4.0 },
    { time: '12:03', temp: 4.3 },
    { time: '12:04', temp: 4.2 },
    { time: '12:05', temp: 4.2 },
  ]);

  // Sound generator using Web Audio API
  const playAlertBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio not permitted or not supported
    }
  };

  // Periodic subtle drift or real-time simulation tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSensor((prev) => {
        if (!prev.isOnline) return prev;

        // Subtle realistic temperature fluctuation ±0.1°C around current target
        let drift = (Math.random() - 0.5) * 0.2;
        // If out of bounds keep drifting towards normal or remain high/low based on simulation
        let newTemp = Math.round((prev.temperature + drift) * 10) / 10;

        let alertType: SensorStatus['alertType'] = 'none';
        if (newTemp > maxTemp) {
          alertType = 'high_temp';
        } else if (newTemp < minTemp) {
          alertType = 'low_temp';
        }

        return {
          ...prev,
          temperature: newTemp,
          alertType,
        };
      });

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setHistory((prev) => {
        const lastTemp = sensor.isOnline ? sensor.temperature : (prev[prev.length - 1]?.temp || 4.2);
        const updated = [...prev.slice(-14), { time: timeStr, temp: lastTemp }];
        return updated;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [minTemp, maxTemp, sensor.isOnline, sensor.temperature]);

  // Handlers for simulation buttons
  const handleSimHeat = () => {
    setSensor((prev) => ({
      ...prev,
      temperature: 13.8,
      alertType: 'high_temp',
      isOnline: true,
      powerStatus: 'مستقرة (220V)',
      wifiStrength: 92,
      cloudSync: 'متصل (Active)',
    }));
    playAlertBeep();
  };

  const handleSimFreeze = () => {
    setSensor((prev) => ({
      ...prev,
      temperature: -2.4,
      alertType: 'low_temp',
      isOnline: true,
      powerStatus: 'مستقرة (220V)',
      wifiStrength: 95,
      cloudSync: 'متصل (Active)',
    }));
    playAlertBeep();
  };

  const handleTogglePower = () => {
    setSensor((prev) => {
      if (prev.isOnline) {
        return {
          ...prev,
          isOnline: false,
          powerStatus: 'منفصل تماماً',
          wifiStrength: 0,
          cloudSync: 'غير متصل',
          alertType: 'power_cut',
        };
      } else {
        return {
          ...prev,
          isOnline: true,
          powerStatus: 'مستقرة (220V)',
          wifiStrength: 95,
          cloudSync: 'متصل (Active)',
          alertType: 'none',
          temperature: 4.2,
        };
      }
    });
    playAlertBeep();
  };

  const handleResetSim = () => {
    setSensor({
      temperature: 4.2,
      targetMin: minTemp,
      targetMax: maxTemp,
      powerStatus: 'مستقرة (220V)',
      wifiStrength: 95,
      cloudSync: 'متصل (Active)',
      alertType: 'none',
      isOnline: true,
    });
  };

  const handleSaveRanges = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = parseFloat(tempInputMin);
    const maxVal = parseFloat(tempInputMax);
    if (!isNaN(minVal) && !isNaN(maxVal) && minVal < maxVal) {
      setMinTemp(minVal);
      setMaxTemp(maxVal);
      setRangeSavedToast(true);
      setTimeout(() => setRangeSavedToast(false), 3000);
    }
  };

  const isHighAlarm = sensor.alertType === 'high_temp';
  const isLowAlarm = sensor.alertType === 'low_temp';
  const isPowerCut = !sensor.isOnline || sensor.alertType === 'power_cut';
  const hasAlarm = isHighAlarm || isLowAlarm || isPowerCut;

  return (
    <section id="live-demo" className="py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs mb-3 border border-sky-500/30">
            <Sliders className="w-3.5 h-3.5" />
            <span>لوحة المراقبة التفاعلية المباشرة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">
            جرب نظام المراقبة والمحاكاة بنفسك الآن
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            اختبر استجابة نظام Temper-IT عند ارتفاع حرارة التبريد، التجميد المفاجئ، أو انقطاع الكهرباء والإنترنت.
            نفس التجربة التي ستتحكم من خلالها بأجهزتك بعد الشراء.
          </p>
        </div>

        {/* Live Warning Alarm Banners */}
        {hasAlarm && (
          <div className="mb-6 transition-all duration-300">
            {isHighAlarm && (
              <div className="bg-rose-500/20 border-2 border-rose-500 text-rose-200 p-4 rounded-2xl flex items-center justify-between pulse-red">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">
                      ⚠️ تنبيه حرج: ارتفاع مفاجئ في درجة الحرارة ({sensor.temperature}°C)
                    </h4>
                    <p className="text-xs text-rose-300">
                      تخطت درجة الحرارة الحد الأقصى المسموح به ({maxTemp}°C). تم إرسال إشعار فوري عبر واتساب للعميل.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResetSim}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  إسكات وإعادة ضبط
                </button>
              </div>
            )}

            {isLowAlarm && (
              <div className="bg-cyan-500/20 border-2 border-cyan-400 text-cyan-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                    <Snowflake className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">
                      ❄️ خطر تجميد: انخفاض الحرارة دون الحد الأدنى ({sensor.temperature}°C)
                    </h4>
                    <p className="text-xs text-cyan-300">
                      درجة الحرارة هبطت دون الحد المسموح ({minTemp}°C). خطر تلف الكواشف والأدوية الحساسة للتجمد.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResetSim}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  إعادة ضبط
                </button>
              </div>
            )}

            {isPowerCut && (
              <div className="bg-amber-500/20 border-2 border-amber-500 text-amber-200 p-4 rounded-2xl flex items-center justify-between pulse-red">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Power className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base">
                      ⚡ انقطاع التيار الكهربائي أو شبكة الإنترنت!
                    </h4>
                    <p className="text-xs text-amber-300">
                      توقف استقبال إشارة الحساس. السيرفر السحابي أطلق إنذار الطوارئ الفوري على هاتف المسؤول.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleTogglePower}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  إعادة تشغيل الكهرباء
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls Column (Left in RTL, Right in LTR) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Temperature Threshold Card */}
            <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-xl">
              <h3 className="text-base font-black text-white mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>ضبط النطاق الآمن (°C)</span>
                </span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                    soundEnabled ? 'bg-sky-500/30 text-sky-300' : 'bg-slate-700 text-slate-400'
                  }`}
                  title={soundEnabled ? 'الصوت مفعل' : 'الصوت مغلق'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{soundEnabled ? 'صوت التنبيه' : 'صامت'}</span>
                </button>
              </h3>

              <form onSubmit={handleSaveRanges} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الحد الأدنى للحرارة (Min Temp °C):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={tempInputMin}
                    onChange={(e) => setTempInputMin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-sky-500 text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الحد الأقصى للحرارة (Max Temp °C):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={tempInputMax}
                    onChange={(e) => setTempInputMax(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-sky-500 text-left"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>حفظ نطاق درجات الحرارة</span>
                </button>

                {rangeSavedToast && (
                  <div className="text-center text-xs text-emerald-400 font-bold bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/30">
                    تم تحديث النطاق الآمن ({minTemp}°C - {maxTemp}°C)
                  </div>
                )}
              </form>
            </div>

            {/* Hardware Simulator Controls */}
            <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-3.5">
              <h3 className="text-base font-black flex items-center gap-2 text-amber-400">
                <Flame className="w-4 h-4" />
                <span>أدوات محاكاة الأعطال الحية</span>
              </h3>

              <div className="space-y-2.5 text-xs font-bold">
                <button
                  onClick={handleSimHeat}
                  className="w-full bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-200 py-2.5 px-4 rounded-xl flex items-center justify-between transition cursor-pointer"
                >
                  <span>رفع الحرارة (محاكاة عطل التبريد)</span>
                  <Flame className="w-4 h-4 text-rose-400" />
                </button>

                <button
                  onClick={handleSimFreeze}
                  className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 py-2.5 px-4 rounded-xl flex items-center justify-between transition cursor-pointer"
                >
                  <span>خفض الحرارة (محاكاة التجميد الزائد)</span>
                  <Snowflake className="w-4 h-4 text-cyan-400" />
                </button>

                <button
                  onClick={handleTogglePower}
                  className="w-full bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-200 py-2.5 px-4 rounded-xl flex items-center justify-between transition cursor-pointer"
                >
                  <span>{sensor.isOnline ? 'قطع الكهرباء والنت عن الحساس' : 'إعادة توصيل الكهرباء للحساس'}</span>
                  <Power className="w-4 h-4 text-amber-400" />
                </button>

                <button
                  onClick={handleResetSim}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 px-4 rounded-xl transition border border-slate-600 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>إعادة ضبط الحساس للوضع الطبيعي</span>
                </button>
              </div>
            </div>

            {/* Link to post-purchase official control website */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60 text-xs text-slate-400">
              <span className="text-slate-300 font-bold block mb-1">لوحة العميل الرسمية بعد الشراء:</span>
              <p className="mb-3 text-[11px] leading-relaxed">
                بعد استلام جهازك، يمكنك فتح موقع التحكم الرسمي لربط كود الحساس ومتابعة الثلاجات من أي مكان في العالم.
              </p>
              <a
                href={OFFICIAL_CONTROLLER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold underline"
              >
                <span>فتح موقع التحكم الرسمي Temper-IT</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Live Sensor Gauge & Diagnostics Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-7 border border-slate-700/80 shadow-xl">
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-700">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>قراءة الحساس اللحظية</span>
                    <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تحديث فوري عبر الإنترنت · حساس رقمي دقيق
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-full border font-bold text-xs flex items-center gap-2 transition-all duration-300 ${
                    !sensor.isOnline
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isHighAlarm
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isLowAlarm
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      !sensor.isOnline
                        ? 'bg-rose-400'
                        : isHighAlarm || isLowAlarm
                        ? 'bg-rose-400 animate-ping'
                        : 'bg-emerald-400 animate-ping'
                    }`}
                  ></span>
                  <span>
                    {!sensor.isOnline
                      ? 'الحساس غير متصل (انقطاع طاقة/نت)'
                      : isHighAlarm
                      ? 'تنبيه: حرارة مرتفعة خارج المدى'
                      : isLowAlarm
                      ? 'تنبيه: حرارة منخفضة جداً'
                      : 'الحساس متصل ويعمل بانتظام'}
                  </span>
                </div>
              </div>

              {/* Gauge & Diagnostics Grid */}
              <div className="grid sm:grid-cols-2 gap-6 my-6 items-center">
                {/* Big Temperature Gauge Box */}
                <div
                  className={`rounded-2xl p-6 text-center border transition-all duration-300 ${
                    !sensor.isOnline
                      ? 'bg-slate-950 border-rose-800'
                      : isHighAlarm
                      ? 'bg-rose-950/40 border-rose-600 shadow-lg shadow-rose-950/50'
                      : isLowAlarm
                      ? 'bg-cyan-950/40 border-cyan-600 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    درجة الحرارة المسجلة
                  </span>

                  <div
                    className={`text-5.5xl sm:text-6xl font-black font-mono tracking-tight transition-colors duration-300 ${
                      !sensor.isOnline
                        ? 'text-slate-600'
                        : isHighAlarm
                        ? 'text-rose-400'
                        : isLowAlarm
                        ? 'text-cyan-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {sensor.isOnline ? `${sensor.temperature.toFixed(1)}°C` : '--.-°C'}
                  </div>

                  <div className="mt-4 text-xs font-semibold text-slate-400">
                    النطاق المسموح به حالياً:{' '}
                    <span className="text-white font-bold font-mono">
                      {minTemp.toFixed(1)}°C - {maxTemp.toFixed(1)}°C
                    </span>
                  </div>
                </div>

                {/* Diagnostics Status Tickers */}
                <div className="space-y-3">
                  <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">حالة التغذية الكهربائية:</span>
                    <span
                      className={`font-bold flex items-center gap-1.5 ${
                        sensor.isOnline ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{sensor.powerStatus}</span>
                    </span>
                  </div>

                  <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">قوة إشارة Wi-Fi:</span>
                    <span
                      className={`font-bold flex items-center gap-1.5 font-mono ${
                        sensor.isOnline ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      <Wifi className="w-3.5 h-3.5" />
                      <span>{sensor.isOnline ? `ممتاز (${sensor.wifiStrength}%)` : 'مقطوع (0%)'}</span>
                    </span>
                  </div>

                  <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">التزامن السحابي:</span>
                    <span
                      className={`font-bold flex items-center gap-1.5 ${
                        sensor.isOnline ? 'text-cyan-400' : 'text-rose-400'
                      }`}
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>{sensor.cloudSync}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time Trend Sparkline SVG */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-3">
                  <span className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>سجل تغير درجات الحرارة اللحظي (آخر القراءات)</span>
                  </span>
                  <span className="text-emerald-400 font-mono">● مباشر (Live Stream)</span>
                </div>

                {/* SVG Graph */}
                <div className="h-44 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                    {/* Safe Range Zone Background */}
                    <rect
                      x="0"
                      y={Math.max(0, 120 - ((maxTemp + 10) / 30) * 120)}
                      width="500"
                      height={Math.max(10, ((maxTemp - minTemp) / 30) * 120)}
                      fill="#0284c7"
                      fillOpacity="0.08"
                    />

                    {/* Threshold Dashed Lines */}
                    <line
                      x1="0"
                      y1={Math.max(0, 120 - ((maxTemp + 10) / 30) * 120)}
                      x2="500"
                      y2={Math.max(0, 120 - ((maxTemp + 10) / 30) * 120)}
                      stroke="#f43f5e"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.6"
                    />
                    <line
                      x1="0"
                      y1={Math.max(0, 120 - ((minTemp + 10) / 30) * 120)}
                      x2="500"
                      y2={Math.max(0, 120 - ((minTemp + 10) / 30) * 120)}
                      stroke="#06b6d4"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.6"
                    />

                    {/* Points & Line */}
                    {history.length > 1 && (
                      <polyline
                        fill="none"
                        stroke={isHighAlarm ? '#f43f5e' : isLowAlarm ? '#06b6d4' : '#10b981'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={history
                          .map((pt, idx) => {
                            const x = (idx / (history.length - 1)) * 500;
                            // Map -10°C .. +20°C to 120 .. 0
                            const normalized = Math.min(Math.max((pt.temp + 10) / 30, 0), 1);
                            const y = 120 - normalized * 120;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    )}

                    {/* Dots */}
                    {history.map((pt, idx) => {
                      const x = (idx / (history.length - 1)) * 500;
                      const normalized = Math.min(Math.max((pt.temp + 10) / 30, 0), 1);
                      const y = 120 - normalized * 120;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r={idx === history.length - 1 ? 4 : 2}
                          fill={isHighAlarm ? '#f43f5e' : isLowAlarm ? '#06b6d4' : '#10b981'}
                        />
                      );
                    })}
                  </svg>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-800/80">
                  <span>الحد الأدنى: {minTemp}°C</span>
                  <span>الوضع الحالي: {sensor.isOnline ? `${sensor.temperature}°C` : 'غير متصل'}</span>
                  <span>الحد الأقصى: {maxTemp}°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
