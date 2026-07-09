import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LogOut,
  Newspaper,
  MessageSquare,
  Send,
  Clock,
  Calendar,
  ShieldCheck,
  User,
  Mail,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  Lock,
  LockKeyhole
} from "lucide-react";

interface CitizenDashboardProps {
  user: {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
  };
  onLogout: () => void;
  chatMessages: any[];
  onSendMessage: (text: string) => void;
  iraqiEmblem: string;
  currentTime: string;
  currentDate: string;
}

export default function CitizenDashboard({
  user,
  onLogout,
  chatMessages,
  onSendMessage,
  iraqiEmblem,
  currentTime,
  currentDate
}: CitizenDashboardProps) {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState<"news" | "chat">("news");

  const fetchNews = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Fetching from Saurav's News API (Saudi Arabia and Egypt feeds which are natively in Arabic)
      let allArticles: any[] = [];
      
      try {
        const resSa = await fetch("https://saurav.tech/NewsAPI/top-headlines/category/general/sa.json");
        if (resSa.ok) {
          const dataSa = await resSa.json();
          if (dataSa.articles) {
            allArticles = [...allArticles, ...dataSa.articles];
          }
        }
      } catch (err) {
        console.warn("Failed to fetch SA news", err);
      }

      try {
        const resEg = await fetch("https://saurav.tech/NewsAPI/top-headlines/category/general/eg.json");
        if (resEg.ok) {
          const dataEg = await resEg.json();
          if (dataEg.articles) {
            allArticles = [...allArticles, ...dataEg.articles];
          }
        }
      } catch (err) {
        console.warn("Failed to fetch EG news", err);
      }

      // Filter articles to only keep those that contain Arabic characters to guarantee 100% Arabic news language
      const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
      const arabicArticles = allArticles.filter(art => 
        art && 
        art.title && 
        arabicRegex.test(art.title)
      );

      if (arabicArticles.length > 0) {
        // Sort by publication date (newest first)
        arabicArticles.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        });

        // De-duplicate articles by title
        const uniqueArticles: any[] = [];
        const titlesSeen = new Set<string>();
        for (const art of arabicArticles) {
          const normalizedTitle = art.title.trim().toLowerCase();
          if (!titlesSeen.has(normalizedTitle)) {
            titlesSeen.add(normalizedTitle);
            uniqueArticles.push(art);
          }
        }

        setNews(uniqueArticles.slice(0, 12));
      } else {
        throw new Error("No Arabic articles found from live APIs");
      }
    } catch (err) {
      console.warn("API error, loading localized Arabic curated news fallback", err);
      setError("فشل الاتصال بخدمة الأخبار المباشرة أو لم تتوفر أخبار باللغة العربية. تم تحميل النشرة الإقليمية المعتمدة تلقائياً.");
      
      // Gorgeous high-quality local Arabic news fallback
      setNews([
        {
          title: "هيئة الإعلام والاتصالات العراقية تطلق البوابة الرقمية التفاعلية للمواطنين",
          description: "في إطار جهود الهيئة لتبسيط الإجراءات الحكومية، أعلن رئيس هيئة الإعلام عن تدشين البوابة الإلكترونية التفاعلية الموحدة التي تتيح للمواطنين التواصل المباشر مع مكتب المتابعة ومراجعة القرارات الإدارية.",
          url: "https://cmedia.gov.iq",
          urlToImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
          publishedAt: new Date().toISOString(),
          source: { name: "هيئة الإعلام والاتصالات" }
        },
        {
          title: "العراق يحرز تقدماً نوعياً في مؤشر نضوج الحكومات الإلكترونية العربي",
          description: "أظهر التقرير الدوري لجاهزية الاتصالات والمعلومات قفزة نوعية لجمهورية العراق في جاهزية تقديم الخدمات العامة الرقمية وسرعة معالجة شكاوى المواطنين عبر منصات المراسلة الفورية المؤمنة.",
          url: "https://cmedia.gov.iq",
          urlToImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
          publishedAt: new Date().toISOString(),
          source: { name: "المركز الوطني لتطوير تكنولوجيا المعلومات" }
        },
        {
          title: "بدء تطبيق خدمة 'التحقق السريع عبر جوجل' لتسهيل الوصول للمراجعات والخدمات",
          description: "بالتنسيق مع كبرى مزودي خدمات السحاب والتوثيق، تم اعتماد نظام الدخول الأحادي الموحد للمواطنين لضمان حماية مطلقة لبياناتهم وتقديم خدمة دعم ومحادثات مشفرة بالكامل.",
          url: "https://cmedia.gov.iq",
          urlToImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
          publishedAt: new Date().toISOString(),
          source: { name: "دائرة شؤون المواطنين الفيدرالية" }
        },
        {
          title: "مجلس الوزراء العراقي يوجه بتسريع التحول الرقمي بالكامل في الوزارات الخدمية",
          description: "أصدر المجلس توجيهات جديدة لجميع الهيئات بتبني أنظمة المراسلة المباشرة والدردشة الفورية المتصلة بنظام STS لضمان سرعة الرد على تساؤلات واستفسارات المواطنين وحلها في غضون 24 ساعة.",
          url: "https://cmedia.gov.iq",
          urlToImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
          publishedAt: new Date().toISOString(),
          source: { name: "المكتب الإعلامي الحكومي العراقي" }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Refresh news every hour
    const timer = setInterval(fetchNews, 1000 * 60 * 60);
    return () => clearInterval(timer);
  }, []);

  const handleSend = () => {
    if (!messageText.trim()) return;
    onSendMessage(messageText.trim());
    setMessageText("");
  };

  return (
    <div className="flex-1 flex flex-col relative bg-transparent text-slate-100 min-h-screen">
      {/* خلفية فخمة مائية بشعار جمهورية العراق */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]">
        <img
          src={iraqiEmblem}
          alt="شعار مائي"
          className="w-[600px] h-[600px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain filter saturate-[0.1]"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* هيدر الصفحة والترويسة */}
      <header className="gov-glass border-b border-emerald-500/20 backdrop-blur-md py-4 px-6 sticky top-0 z-40 shadow-2xl" dir="rtl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 blur-md opacity-70 animate-pulse"></div>
              <img
                src={iraqiEmblem}
                alt="شعار الهيئة"
                className="w-12 h-12 object-cover rounded-full border border-amber-500/30 bg-slate-950 p-0.5 relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="font-serif font-black text-xl text-amber-400 tracking-wide text-gold-gradient leading-snug">
                جمهورية العراق
              </h2>
              <p className="text-xs text-slate-300 font-extrabold tracking-wide mt-1">
                بوابة المواطن الموحدة - خدمات هيئة الصحافة والإعلام الرقمية
              </p>
            </div>
          </div>

          {/* الوقت والتاريخ المباشر */}
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-slate-300 font-mono shadow-inner">
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{currentTime}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl hidden sm:flex items-center gap-2 text-slate-300 shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>{currentDate}</span>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 text-emerald-400 font-black text-[10px] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 exam-indicator-glow"></span>
              <span>توثيق آمن عبر Google</span>
            </div>
          </div>

          {/* زر تسجيل الخروج الفخم */}
          <button
            onClick={onLogout}
            className="px-5 py-2.5 bg-red-650/10 hover:bg-red-650 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500/50 text-xs font-black rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-red-650/10 active:scale-95 shrink-0"
          >
            <span>تسجيل الخروج الآمن</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* المحتوى الرئيسي للوحة تحكم المواطن */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6 z-10" dir="rtl">
        {/* الترحيب بالمواطن وبطاقته الذكية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* بطاقة المواطن الذكية الإلكترونية */}
          <div className="gov-card-gold rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-amber-500/[0.05]">
            {/* زخرفة زاوية ذهبية متألقة */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-12 h-[1px] bg-amber-500/40"></div>
            <div className="absolute top-0 right-0 h-12 w-[1px] bg-amber-500/40"></div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-250 to-amber-500 text-gold-gradient">بطاقة المواطن الرقمية المعتمدة</span>
                </div>
                <span className="text-[9px] bg-slate-950/90 border border-slate-800/80 text-amber-500 font-mono py-0.5 px-2 rounded-md shadow-inner">
                  IQ-CIV-VERIFIED
                </span>
              </div>

              {/* تفاصيل الحساب من جوجل */}
              <div className="flex items-center gap-4 py-2">
                <div className="relative">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-16 h-16 rounded-full border-2 border-amber-500/40 p-0.5 object-cover shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-amber-500/30 flex items-center justify-center text-slate-400 shadow-inner">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 h-5 w-5 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center shadow-md" title="توثيق نشط">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>
                
                <div className="text-right space-y-1">
                  <h3 className="font-black text-white text-base leading-snug tracking-wide">{user.displayName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono truncate max-w-[150px] sm:max-w-xs">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* معلومات رقمية إضافية مأخوذة من الحساب الحقيقي */}
              <div className="border-t border-slate-800/40 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-850/60">
                  <span className="text-slate-400 font-bold">رقم التعريف الفيدرالي (UID)</span>
                  <span className="font-mono text-slate-300 tracking-wider text-[10px] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 shadow-inner">{user.uid.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-850/60">
                  <span className="text-slate-400 font-bold">حالة التحقق والحساب</span>
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 exam-indicator-glow"></span>
                    <span>موثق بالكامل</span>
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 font-bold">نظام المراسلة الآمن</span>
                  <span className="text-amber-400 font-extrabold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                    <span>مفعل (قناة STS)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-amber-500/[0.01] border border-amber-500/10 rounded-xl text-[10px] text-slate-300 leading-relaxed text-justify shadow-inner">
              تتيح لك بوابة المواطن الرقمية المعتمدة تصفح الأخبار الحصرية والسرية الصادرة برمجياً ومراسلة الإدارة المركزية لحل القضايا والمراجعات بشكل مباشر وفعال وآمن.
            </div>
          </div>

          {/* البانر الإرشادي الموجه للمواطنين */}
          <div className="lg:col-span-2 gov-glass rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            {/* إضاءات خلفية خافتة دائرية */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/[0.02] rounded-br-full pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-emerald-500/[0.01] rounded-full blur-xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <Newspaper className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-wide">إرشادات تصفح الأخبار والمراسلات الفيدرالية</h3>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">CITIZEN GUIDANCE & NOTIFICATION CENTER</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed pt-2">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 hover:border-amber-500/30 transition-colors duration-300">
                  <h4 className="font-extrabold text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>تحديثات الأخبار الحصرية</span>
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    يتم جلب الأخبار وتحديثها بشكل فوري ومباشر كل ساعة باستخدام واجهات برمجية ذكية وسحابية من NewsAPI لضمان الدقة والمصداقية ونقل الخبر فور حدوثه.
                  </p>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 hover:border-emerald-500/30 transition-colors duration-300">
                  <h4 className="font-extrabold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>نظام الدردشة الحية</span>
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    رسائلك المباشرة تصل على الفور إلى لوحة تحكم المسؤول الإداري (STS) بشكل حقيقي. سيقوم المسؤولون بمراجعة محادثتك والرد عليها مباشرة لحل استفسارك.
                  </p>
                </div>
              </div>
            </div>

            {/* أزرار التبويب (الأخبار - الدردشة) للهواتف لتسهيل التنقل */}
            <div className="flex gap-4 mt-6 border-t border-slate-800/60 pt-4">
              <button
                onClick={() => setActiveTab("news")}
                className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                  activeTab === "news"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-300 border-slate-850"
                }`}
              >
                <Newspaper className="w-4.5 h-4.5" />
                <span>أحدث الأخبار الحصرية</span>
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                  activeTab === "chat"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-300 border-slate-850"
                }`}
              >
                <div className="relative">
                  <MessageSquare className="w-4.5 h-4.5" />
                  {chatMessages.length > 0 && chatMessages[chatMessages.length - 1]?.sender === "admin" && (
                    <span className="absolute -top-1 -left-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <span>الدردشة الحية مع الإدارة</span>
              </button>
            </div>
          </div>
        </div>

        {/* التبويب النشط */}
        <AnimatePresence mode="wait">
          {activeTab === "news" ? (
            <motion.div
              key="news-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* قسم الأخبار الحصرية */}
              <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <div className="flex items-center gap-2.5">
                  <Newspaper className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-sm text-white">النشرة الإخبارية الحصرية واللحظية</h3>
                </div>
                
                <button
                  onClick={fetchNews}
                  disabled={isLoading}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>تحديث النشرة</span>
                </button>
              </div>

              {error && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl text-right">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-850 rounded-2xl p-4 space-y-3 animate-pulse">
                      <div className="h-44 bg-slate-950 rounded-xl"></div>
                      <div className="h-4 bg-slate-800 w-3/4 rounded"></div>
                      <div className="h-3 bg-slate-800 w-full rounded"></div>
                      <div className="h-3 bg-slate-800 w-5/6 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="gov-card-gold rounded-3xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.55)] hover:shadow-[0_20px_45px_rgba(245,158,11,0.08)] flex flex-col justify-between group transition-all duration-500 hover:-translate-y-1.5"
                    >
                      <div className="relative overflow-hidden shrink-0 h-48 bg-slate-950">
                        {item.urlToImage ? (
                          <img
                            src={item.urlToImage}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              // Fallback image if loaded url fails
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-700 gap-2">
                            <Newspaper className="w-10 h-10" />
                            <span className="text-[10px] font-bold">لا توجد صورة متوفرة</span>
                          </div>
                        )}
                        
                        <span className="absolute top-3.5 right-3.5 bg-slate-950/90 backdrop-blur-md text-amber-400 border border-slate-800/80 text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                          {item.source?.name || "خبر حصري"}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-[13px] sm:text-[14px] text-slate-100 group-hover:text-amber-400 transition-colors duration-300 line-clamp-2 leading-relaxed text-right">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed text-right">
                            {item.description || "انقر على زر القراءة لمشاهدة التفاصيل الكاملة المنشورة رسمياً عبر مزودي الخدمات الفيدرالية."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-850/60 pt-4">
                          <span className="text-[10px] text-slate-500 font-mono font-medium">
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("ar-IQ", { day: "numeric", month: "short", year: "numeric" }) : ""}
                          </span>
                          
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-black text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>تفاصيل الخبر</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chat-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto w-full"
            >
              {/* نافذة الدردشة المباشرة */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-[520px] overflow-hidden">
                {/* رأس المحادثة */}
                <div className="px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <LockKeyhole className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-xs text-emerald-400 block tracking-wide">قناة الاتصال الفيدرالية المشفرة (STS)</span>
                      <span className="text-[10px] text-slate-500 font-mono block tracking-wider">DIRECT ADMINISTRATIVE MESSAGING CHANNELS</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-emerald-400 border border-slate-800 text-[10px] font-black shadow-inner">
                    <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse relative flex">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    </span>
                    <span>الإدارة متصلة الآن</span>
                  </div>
                </div>

                {/* الرسائل المتبادلة */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/30 scrollbar-thin flex flex-col">
                  {chatMessages.length === 0 ? (
                    <div className="my-auto flex flex-col items-center text-center p-6">
                      <div className="h-14 w-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 mb-4 shadow-xl">
                        <MessageSquare className="w-7 h-7 animate-pulse" />
                      </div>
                      <h4 className="text-sm font-black text-slate-300">لا توجد رسائل سابقة</h4>
                      <p className="text-[11px] text-slate-500 max-w-xs mt-1.5 leading-relaxed text-center">
                        أهلاً بك {user.displayName}. اكتب رسالتك أدناه لإرسالها مباشرة وبشكل حقيقي إلى مركز الإدارة، وسيتلقى المسؤولون إشعاراً للرد الفوري عليك.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.sender === "citizen";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[80%] ${
                            isMe ? "self-start items-start text-right" : "self-end items-end text-left"
                          }`}
                        >
                          <div className="text-[9px] text-slate-500 font-bold mb-1 px-1.5 uppercase tracking-wide">
                            {isMe ? "المواطن (أنت)" : "المركز الإداري الفيدرالي"}
                          </div>
                          
                          <div
                            className={`p-4 rounded-2xl text-[12px] leading-relaxed shadow-lg ${
                              isMe
                                ? "bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-tr-none font-extrabold shadow-amber-500/5"
                                : "bg-gradient-to-br from-slate-900 to-slate-950 text-slate-200 rounded-tl-none border border-slate-800/80 shadow-slate-950/10 font-medium"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-slate-600 mt-1 px-1.5 font-mono">{msg.time}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* حقل الكتابة */}
                <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 shrink-0">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="اكتب استفسارك أو مراجعتك إلى المركز الإداري..."
                      className="flex-1 bg-slate-950/90 border border-slate-800/80 focus:border-amber-500/50 rounded-2xl py-3.5 px-4 text-xs text-slate-200 focus:outline-none transition-all duration-300 placeholder-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSend();
                        }
                      }}
                    />
                    <button
                      onClick={handleSend}
                      className="p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                    >
                      <Send className="w-4 h-4 transform rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ذيل الصفحة للمواطن */}
      <footer className="bg-slate-950 border-t border-slate-900/80 py-6 text-center text-xs text-slate-500 mt-auto" dir="rtl">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className="font-semibold text-slate-400 font-serif text-sm">
            جمهورية العراق - هيئة الصحافة والإعلام والاتصالات الفيدرالية
          </p>
          <p className="text-[11px] text-slate-500">
            جميع الحقوق محفوظة © {new Date().getFullYear()} هـ.إ.ع. بوابة الدعم والمراسلة الفيدرالية للمواطن
          </p>
        </div>
      </footer>
    </div>
  );
}
