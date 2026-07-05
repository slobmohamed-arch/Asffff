/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Lock,
  Clock,
  FileText,
  CheckCircle2,
  Building2,
  Bell,
  QrCode,
  LockKeyhole,
  Compass,
  FileBadge,
  FileSpreadsheet,
  Check,
  X,
  Mail,
  Headphones
} from "lucide-react";

// الشعار الرسمي العراقي الذي تم توليده
// @ts-ignore
import iraqiEmblem from "./assets/images/iraqi_emblem_1783255000000.jpg";

export default function App() {
  // الحالات البرمجية الخاصة بالواجهة الترحيبية والتطبيق
  const [showSplash, setShowSplash] = useState(true);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [time, setTime] = useState(0); // العداد العشري (من 0 إلى 150 جزء من الثانية)
  const [badgeActive, setBadgeActive] = useState(false); // حالة الشارة الخضراء
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // التحقق من حالة الشارة في localStorage عند التشغيل الأول
  useEffect(() => {
    const savedBadgeStatus = localStorage.getItem("iraqi_media_badge_active");
    if (savedBadgeStatus === "true") {
      setBadgeActive(true);
    }

    // تحديث الوقت والتاريخ بانتظام باللغة العربية
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("ar-IQ", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      );
      setCurrentDate(
        now.toLocaleDateString("ar-IQ", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // التحكم بمؤقت الواجهة الترحيبية (15 ثانية بالضبط)
  useEffect(() => {
    if (!showSplash) return;

    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime >= 150) {
          clearInterval(timer);
          setShowSplash(false);
          return 150;
        }
        return prevTime + 1;
      });
    }, 100); // تحديث كل 100 مللي ثانية للوصول لـ 150 خطوة (15 ثانية)

    return () => clearInterval(timer);
  }, [showSplash]);

  // حساب الوقت المنقضي بالنسبة المئوية والثواني
  const progressPercent = Math.min((time / 150) * 100, 100);
  const secondsElapsed = Math.floor(time / 10);
  const secondsRemaining = 15 - secondsElapsed;

  // دالة تغيير حالة الشارة من خلال الزر السري الأحمر
  const handleSecretToggle = () => {
    const codeInput = window.prompt("اكتب كود الوزارة");
    
    // التحقق من صحة الكود المدخل
    if (codeInput === null) {
      // إذا قام المستخدم بإلغاء مربع الحوار
      return;
    }

    if (codeInput === "Gtasen1122") {
      // كود صحيح: تفعيل أو إخفاء الشارة
      const newBadgeState = !badgeActive;
      setBadgeActive(newBadgeState);
      localStorage.setItem("iraqi_media_badge_active", String(newBadgeState));
    } else {
      // كود خاطئ
      window.alert("الكود غير صحيح، لا تملك الصلاحية");
    }
  };

  // رسائل التحميل المحاكاة للنظام الحكومي
  const getLoadingMessage = () => {
    if (secondsElapsed < 3) return "جاري تحميل ملفات النظام الفيدرالي والتحقق من الهوية...";
    if (secondsElapsed < 6) return "فحص شهادات الأمان الرقمية التابعة لهيئة الاتصالات...";
    if (secondsElapsed < 9) return "تأمين قنوات الاتصال وتشفير البيانات العسكرية والمدنية...";
    if (secondsElapsed < 12) return "مزامنة البيانات الحية مع السجل الوطني الموحد...";
    return "تجهيز لوحة تحكم الموظف الآمنة لجمهورية العراق...";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-x-hidden antialiased flex flex-col" dir="rtl">
      <AnimatePresence mode="wait">
        {/* الجزء الأول: الواجهة الترحيبية (Splash Screen) */}
        {showSplash && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-50 flex flex-col justify-between p-8 bg-gradient-to-b from-slate-950 via-[#0a141d] to-slate-950 text-white overflow-hidden"
          >
            {/* زخارف وخلفية تفاعلية حكومية */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>

            {/* الهيدر العلوي في السبلاش */}
            <div className="flex justify-between items-center w-full max-w-4xl mx-auto z-10">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono tracking-wider text-slate-400">SECURE STATE NETWORK v2.7</span>
              </div>
              <button
                onClick={() => setShowSplash(false)}
                className="text-xs px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-full text-slate-400 hover:text-amber-400 transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <span>تخطي العرض (للتجربة)</span>
                <Compass className="w-3.5 h-3.5 animate-spin" />
              </button>
            </div>

            {/* الجزء الأوسط: الشعار والنصوص المتحركة بدقة التوقيت المطلوبة */}
            <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto my-auto z-10 space-y-8">
              {/* الشعار العراقي التوليدي */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative mb-4"
              >
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 blur-md opacity-70 animate-pulse"></div>
                <img
                  src={iraqiEmblem}
                  alt="شعار جمهورية العراق"
                  className="w-40 h-40 object-cover rounded-full border-2 border-amber-500/30 p-1 bg-slate-900 shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* الاسم الأول: يظهر في الثانية الأولى */}
              {secondsElapsed >= 1 && (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 font-serif leading-relaxed"
                >
                  دائرة شؤون موظفي هيئة الإعلام
                </motion.h1>
              )}

              {/* الاسم الثاني: بعد 3 ثوانٍ من ظهور الاسم الأول (عند الثانية 4) */}
              {secondsElapsed >= 4 && (
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-sm md:text-lg font-medium text-slate-300 tracking-wide max-w-2xl px-4"
                >
                  جميع الحقوق محفوظة لدى هيئة الإعلام والاتصالات العراقية
                </motion.p>
              )}

              {/* الاسم الثالث: بعد ذلك مباشرة (عند الثانية 5) */}
              {secondsElapsed >= 5 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-xs md:text-sm font-semibold tracking-widest text-emerald-400 border-t border-slate-800 pt-4 px-8"
                >
                  جمهورية العراق / هيئة الصحافة والإعلام
                </motion.p>
              )}
            </div>

            {/* الهيدر السفلي: شريط تقدم ذكي مع معلومات النظام والعداد التنازلي */}
            <div className="w-full max-w-xl mx-auto z-10 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                <span className="font-medium animate-pulse text-slate-300">
                  {getLoadingMessage()}
                </span>
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-amber-500">
                  متبقي {secondsRemaining} ثانية
                </span>
              </div>

              {/* شريط التقدم الفعلي */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60 p-[1px]">
                <div
                  className="h-full bg-gradient-to-l from-amber-500 via-emerald-500 to-amber-400 rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className="text-[10px] text-center text-slate-500 tracking-widest uppercase mt-1 font-mono">
                SECURE END-TO-END GOVERNMENT INGRESS LAYER
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* الجزء الثاني والثالث: واجهة المستخدم الرئيسية (Dashboard) */}
      <div className="flex-1 flex flex-col relative">
        {/* خلفية وطنية معتدلة فخمة */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
          <img
            src={iraqiEmblem}
            alt="شعار مائي"
            className="w-[600px] h-[600px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* شريط الملاحة والتحكم العلوي */}
        <header className="bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-md py-4 px-6 sticky top-0 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* الشعار والاسم الرسمي */}
            <div className="flex items-center gap-4">
              <img
                src={iraqiEmblem}
                alt="شعار الهيئة"
                className="w-12 h-12 object-cover rounded-full border border-amber-500/20 bg-slate-950 p-0.5"
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="font-serif font-bold text-lg text-amber-400 leading-snug">
                  جمهورية العراق
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  هيئة الإعلام والاتصالات - البوابة الرقمية الموحدة
                </p>
              </div>
            </div>

            {/* الوقت والتاريخ الفعلي */}
            <div className="flex items-center gap-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono font-medium">{currentTime || "00:00:00"}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg hidden sm:flex items-center gap-2 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium">{currentDate || "جاري جلب التاريخ..."}</span>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-emerald-400 font-bold text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>متصل بالشبكة الحكومية</span>
              </div>
            </div>

            {/* زر التفعيل السري في زاوية الهيدر - زر دائري أحمر */}
            <div className="flex items-center">
              <div className="relative group">
                <button
                  onClick={handleSecretToggle}
                  className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 border-2 border-red-400 shadow-lg shadow-red-900/40 hover:shadow-red-500/50 flex items-center justify-center transition-all duration-300 cursor-pointer animate-pulse focus:outline-none"
                  title="الزر السري لتحديث الشارة"
                >
                  <LockKeyhole className="w-3.5 h-3.5 text-white" />
                </button>
                {/* تلميح صغير للزر لتوضيح وظيفته */}
                <div className="absolute left-1/2 -translate-x-1/2 top-10 hidden group-hover:block bg-slate-950 text-red-400 text-[10px] py-1 px-3 rounded-md border border-red-500/30 whitespace-nowrap z-50 shadow-2xl">
                  تفعيل الشارة (كود الوزارة)
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* محتوى الصفحة الرئيسي */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 flex flex-col justify-center items-center gap-8 relative z-10">
          
          {/* الشارة الخضراء - تظهر في أعلى واجهة المستخدم أو فوق البطاقة التعريفية عند تفعيلها */}
          <AnimatePresence>
            {badgeActive && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-xl bg-gradient-to-r from-emerald-900/90 via-emerald-950 to-emerald-900/90 border-2 border-emerald-500 text-emerald-100 px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 relative overflow-hidden"
              >
                {/* بريق الخلفية الخضراء */}
                <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none animate-pulse"></div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-400 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase block">قرار التعيين الفيدرالي الفوري</span>
                    <h3 className="text-sm sm:text-base font-extrabold leading-relaxed text-white">
                      تم التوظيف / تتم مباشرة العمل في تاريخ 2027/1/7
                    </h3>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end text-[10px] text-emerald-400 font-mono">
                  <span>SECURE APPROVED</span>
                  <span>REF: IQ-MEDIA-2027</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* بطاقة الموظف التعريفية */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/30 rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-500"
          >
            {/* الحواف الذهبية التزيينية والزوايا الأنيقة مثل الهويات العسكرية أو الرسمية */}
            <div className="absolute top-0 right-0 w-24 h-[1px] bg-amber-500/40"></div>
            <div className="absolute top-0 right-0 h-24 w-[1px] bg-amber-500/40"></div>
            <div className="absolute bottom-0 left-0 w-24 h-[1px] bg-amber-500/40"></div>
            <div className="absolute bottom-0 left-0 h-24 w-[1px] bg-amber-500/40"></div>

            {/* الجزء العلوي للبطاقة: ترويسة الهوية */}
            <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 flex justify-between items-center bg-gradient-to-l from-slate-900 via-slate-950 to-slate-900">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold tracking-wider text-slate-300">
                  جمهورية العراق - بطاقة هوية الموظف الرقمية
                </span>
              </div>
              <span className="font-mono text-[9px] text-slate-500 tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                SECURE-ID-99321
              </span>
            </div>

            {/* محتوى الهوية الرئيسي */}
            <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start relative">
              {/* الصورة الشخصية الافتراضية مع ختم أمني مائي */}
              <div className="relative group shrink-0">
                <div className="w-32 h-40 bg-slate-950 rounded-lg border-2 border-slate-800 p-1 flex items-center justify-center overflow-hidden relative shadow-lg">
                  {/* خلفية رمزية مائية داخل إطار الصورة */}
                  <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-amber-500 to-transparent"></div>
                  
                  {/* ختم أمني مائي يتقاطع مع الصورة لإعطاء مظهر رسمي تماماً */}
                  <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center rotate-12 z-10 pointer-events-none">
                    <span className="text-[6px] text-amber-500/40 font-mono tracking-tighter text-center">
                      هيئة الإعلام<br />مصدق
                    </span>
                  </div>

                  {/* أيقونة الموظف كبديل فاخر للصورة */}
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-1 z-0">
                    <User className="w-16 h-16 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800/50">موظف عام</span>
                  </div>
                </div>
                {/* شريط صغير أسفل الصورة يوضح الفئة */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-full shadow-lg border border-slate-900">
                  كادر الهيئة
                </div>
              </div>

              {/* تفاصيل الموظف بتنسيق جدول/قائمة أنيقة */}
              <div className="flex-1 w-full space-y-4">
                {/* اسم الموظف بخط عريض وكبير */}
                <div className="text-center sm:text-right">
                  <span className="text-xs text-slate-500 font-bold tracking-wider block mb-1">الاسم الكامل للموظف</span>
                  <h1 className="text-2xl font-black text-white tracking-wide border-b border-slate-800 pb-2 flex items-center justify-center sm:justify-start gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>محمد حمزة عباس</span>
                  </h1>
                </div>

                {/* بقية المعلومات في قائمة جدولية أنيقة للغاية */}
                <div className="grid grid-cols-1 gap-3 text-sm border-t border-slate-800/30 pt-3">
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                    <div className="flex items-center gap-2 text-slate-400">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">الحالة الاجتماعية والسن</span>
                    </div>
                    <span className="font-semibold text-slate-200">بالغ . غير متزوج</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">العنوان ومحل الإقامة</span>
                    </div>
                    <span className="font-semibold text-slate-200">صلاح الدين - قضاء بلد</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                    <div className="flex items-center gap-2 text-slate-400">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">اسم القبيلة</span>
                    </div>
                    <span className="font-semibold text-slate-200">الكمراوي</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">الشهادة المستحصلة</span>
                    </div>
                    <span className="font-semibold text-slate-200">غير متخرج . كاسب</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">الوظيفة داخل الدائرة</span>
                    </div>
                    <span className="font-semibold text-slate-200">مسؤول استقبال ملفات صادرة و واردة</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">الراتب الشهري</span>
                    </div>
                    <span className="font-semibold text-slate-200">600,000 – 650,000 دينار عراقي لا غير</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-xs text-amber-400">رقم البند الفيدرالي</span>
                    </div>
                    <span className="font-mono text-sm font-extrabold tracking-widest text-amber-400 bg-slate-950 px-2.5 py-1 rounded border border-amber-500/20 shadow-inner">
                      08026173401
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-slate-800/40 gap-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">الرسوم المتبقية</span>
                    </div>
                    <span className="font-semibold text-amber-500 text-xs sm:text-sm text-right leading-relaxed max-w-xs">
                      الرسوم المتبقية هي 60.000 دينار ثمن تثبيت العقد عند اطلاق القرار \ وثمن مستحقات الضرائب العراقية \
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-slate-800/40 gap-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">الجهة المصدرة لقرار المباشرة</span>
                    </div>
                    <span className="font-semibold text-slate-200 text-xs sm:text-sm text-right leading-relaxed max-w-xs">
                      دائرة شؤون اعلام صلاح الدين الالكتروني \ وزارة الاعلام العراقية
                    </span>
                  </div>

                  {/* الحالة التوظيفية تحت القرار بلون برتقالي أو أحمر لتمييزها */}
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileBadge className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">الحالة التوظيفية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-lg border transition-all duration-500 ${
                        badgeActive 
                        ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/50" 
                        : "bg-amber-950/80 text-amber-500 border-amber-500/50 animate-pulse"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${badgeActive ? "bg-emerald-400" : "bg-amber-500 animate-ping"}`}></span>
                        <span>{badgeActive ? "معين رسمياً (باشر العمل)" : "تحت القرار"}</span>
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* الجزء السفلي للبطاقة: باركود أمني */}
            <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <QrCode className="w-8 h-8 text-slate-500" />
                <div className="text-[10px] text-slate-500">
                  <p className="font-bold">مستند مشفر بالكامل</p>
                  <p>رقم التحقق: IQ-M-991208</p>
                </div>
              </div>
              
              {/* باركود وهمي مصمم بالـ CSS */}
              <div className="flex items-center h-6 space-x-[2px] rtl:space-x-reverse bg-slate-950 px-3 py-1 rounded border border-slate-800 opacity-60">
                <div className="w-[1px] h-full bg-white"></div>
                <div className="w-[2px] h-full bg-white"></div>
                <div className="w-[1px] h-full bg-white"></div>
                <div className="w-[3px] h-full bg-white"></div>
                <div className="w-[1px] h-full bg-white"></div>
                <div className="w-[2px] h-full bg-white"></div>
                <div className="w-[4px] h-full bg-white"></div>
                <div className="w-[1px] h-full bg-white"></div>
                <div className="w-[2px] h-full bg-white"></div>
                <div className="w-[1px] h-full bg-white"></div>
              </div>
            </div>

          </motion.div>

          {/* زر خدمة العملاء */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-xl animate-fade-in"
            dir="rtl"
          >
            <a
              href="mailto:sts.iraq.news@gmail.com?subject=استفسار بخصوص بوابة موظفي الإعلام"
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-slate-900 via-[#101925] to-slate-900 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl transition-all duration-300 group hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300 shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors">بوابة الدعم الفني وخدمة العملاء</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">انقر هنا لإرسال بريد إلكتروني مباشر وتلقي المساعدة الفورية</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800/80 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300 font-mono w-full sm:w-auto justify-center sm:justify-start shadow-inner">
                <span>sts.iraq.news@gmail.com</span>
                <Mail className="w-4 h-4" />
              </div>
            </a>
          </motion.div>

          {/* لوحة توجيهات عامة وقرارات تضفي مصداقية للنظام الحكومي العراقي */}
          <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-start gap-3">
              <Bell className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-1">تعليمات الأمن السيبراني</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  يُمنع مشاركة هذه الهوية أو الكود الوزاري السري مع أي كادر خارج دائرة شؤون الموظفين. جميع الحركات مسجلة.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-1">قسم الموارد البشرية</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  مراجعة الأمانة العامة لهيئة الإعلام والاتصالات العراقية تتم حصراً بعد تفعيل قرار المباشرة الرسمي.
                </p>
              </div>
            </div>

          </div>

        </main>

        {/* تذييل الصفحة */}
        <footer className="bg-slate-950 border-t border-slate-900/80 py-6 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-6 space-y-2">
            <p className="font-semibold text-slate-400 font-serif text-sm">
              جمهورية العراق - هيئة الصحافة والإعلام والاتصالات الفيدرالية
            </p>
            <p className="text-[11px] text-slate-500">
              جميع الحقوق محفوظة © {new Date().getFullYear()} هـ.إ.ع. نظام الأفراد الآمن
            </p>
          </div>
        </footer>
      </div>

      {/* التنبيه المنبثق عند دخول واجهة المستخدم */}
      <AnimatePresence>
        {!showSplash && showAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-lg bg-gradient-to-br from-slate-900 via-[#0d1520] to-slate-950 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden relative"
              dir="rtl"
            >
              {/* زخرفة وتأثيرات بصرية بأسلوب البينتو */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>

              {/* ترويسة التنبيه */}
              <div className="px-6 py-5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-pulse">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-400">تنبيه إداري رسمي</h3>
                  <p className="text-[10px] text-slate-400 font-mono">OFFICIAL ANNOUNCEMENT</p>
                </div>
              </div>

              {/* محتوى التنبيه */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-white border-r-4 border-amber-500 pr-3 leading-relaxed">
                    دائرة شؤون موظفي الإعلام
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium text-justify">
                    استناداً لتوجيهات الأستاذ الدكتور علي حسن الشمري تم تقسيم الموظفين الى مجموعتين عند اكتمال تدريب المجموعة الاولى يتم اطلاق المجموعة الثانية وتدريبها .
                  </p>
                </div>

                {/* معلومات إضافية تنظيمية */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex gap-3 text-xs text-slate-400">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-300 mb-0.5">تعليمات المتابعة</p>
                    <p className="leading-relaxed">يرجى متابعة التحديثات اليومية عبر بوابتكم الرقمية لمعرفة تاريخ انطلاق دورتكم التدريبية المقررة.</p>
                  </div>
                </div>
              </div>

              {/* ذيل التنبيه وزر التخطي */}
              <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-800/40 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono">REF: IMC-ALERT-2026</span>
                <button
                  onClick={() => setShowAnnouncement(false)}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <span>تخطي وقراءة التنبيه</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
