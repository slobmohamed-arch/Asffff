import React from "react";
import { motion } from "motion/react";
import { UserX, ShieldAlert, AlertOctagon, Lock } from "lucide-react";

// الشعار الرسمي العراقي
// @ts-ignore
import iraqiEmblem from "./assets/images/iraqi_emblem_1783255000000.jpg";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-red-500/30 selection:text-red-200 font-sans" dir="rtl">
      {/* الشريط العلوي الرسمي */}
      <header className="w-full bg-slate-900/90 border-b border-red-900/30 py-4 px-6 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={iraqiEmblem}
              alt="شعار جمهورية العراق"
              className="w-11 h-11 object-cover rounded-full border-2 border-red-500/30 bg-slate-950 p-0.5 shadow-md shadow-red-950/30"
              referrerPolicy="no-referrer"
            />
            <div className="text-right">
              <h1 className="font-serif font-bold text-sm sm:text-base text-red-400">
                جمهورية العراق - هيئة الإعلام والاتصالات
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                REPUBLIC OF IRAQ - MEDIA & COMMUNICATIONS COMMISSION
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>PORTAL ACCESS RESTRICTED</span>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950 border border-red-900/40 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-red-950/40 relative overflow-hidden text-center backdrop-blur-xl"
        >
          {/* لمسات خلفية تزيينية متوهجة */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-800/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* أيقونة حالة الفصل متألقة */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute -inset-2 rounded-full bg-red-500/20 blur-md animate-pulse"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-red-950 via-slate-900 to-red-900/60 border-2 border-red-500/50 flex items-center justify-center shadow-xl text-red-500">
              <UserX className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" />
            </div>
          </div>

          {/* العنوان الرئيسي الطلوب بدقة */}
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight drop-shadow-md">
            هذه المنصة لموظف تم فصله
          </h2>

          <p className="text-sm sm:text-base text-red-300/90 font-medium leading-relaxed max-w-md mx-auto mb-6">
            تم إلغاء تفعيل هذا الحساب وإيقاف جميع صلاحيات الوصول إلى المنصة والخدمات المرتبطة بها بناءً على القرارات الإدارية المعتمدة.
          </p>

          {/* بطاقة التوضيح الإداري */}
          <div className="bg-slate-950/80 border border-red-900/30 rounded-2xl p-4 sm:p-5 text-right space-y-3 mb-6 shadow-inner">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs sm:text-sm border-b border-red-900/20 pb-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
              <span>إشعار إداري رسمـي</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              نود إعلامكم بأن صلاحيات الدخول لهذه المنصة معطلة نهائياً. لا يمكن إجراء أي عمليات إلكترونية أو الوصول إلى البيانات الخاصة بالمنظومة من خلال هذا الحساب.
            </p>
          </div>

          {/* تفاصيل الحالة */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-slate-500 block text-[11px] mb-1">حالة الحساب</span>
              <span className="font-bold text-red-400 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                تم الفصل (معطل)
              </span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-slate-500 block text-[11px] mb-1">صلاحية الوصول</span>
              <span className="font-bold text-slate-300 inline-flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                محظور
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* التذييل الرسمي */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <p>جمهورية العراق - هيئة الإعلام والاتصالات © 2026 - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
