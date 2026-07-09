/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType, auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import CitizenDashboard from "./components/CitizenDashboard";
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
  Headphones,
  LogOut,
  Newspaper,
  BookOpen,
  Upload,
  Image as ImageIcon,
  Trash2,
  Key,
  Eye,
  Menu,
  MessageSquare,
  Send,
  Wallet,
  ArrowRight
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

  // حالات تسجيل الدخول وصلاحيات الموظف الجديدة
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMode, setLoginMode] = useState<"select" | "employee_code" | "citizen_postal">("select");
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<"mohammed" | "abdullah">("mohammed");
  const [citizenError, setCitizenError] = useState(false);
  const [citizenPostalCode, setCitizenPostalCode] = useState("");
  const [citizenErrorMsg, setCitizenErrorMsg] = useState("");

  // حالات الموطن الموثق عبر جوجل
  const [isCitizenLoggedIn, setIsCitizenLoggedIn] = useState(false);
  const [citizenUser, setCitizenUser] = useState<null | {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
  }>(null);
  const [citizenChatMessages, setCitizenChatMessages] = useState<any[]>([]);
  const [activeCitizenChatId, setActiveCitizenChatId] = useState<string | null>(null);

  // حالات عقد الاتفاق ورفع الثبوتيات الجديدة
  const [showContractModal, setShowContractModal] = useState(false);
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [residencePhoto, setResidencePhoto] = useState<string | null>(null);
  const [clause1Answer, setClause1Answer] = useState("");
  const [clause2Answer, setClause2Answer] = useState("");
  const [clause3Answer, setClause3Answer] = useState("");
  const [clause4Answer, setClause4Answer] = useState("");
  const [contractError, setContractError] = useState("");
  const [showContractSuccess, setShowContractSuccess] = useState(false);
  const [showBankIframe, setShowBankIframe] = useState(false);
  const [showBooksIframe, setShowBooksIframe] = useState(false);

  // حالات لوحة تحكم المسؤول (STS)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // لحفظ العقود المرسومة للموظفين
  const [submissions, setSubmissions] = useState<{
    mohammed?: {
      idPhoto: string;
      residencePhoto: string;
      clause1Answer: string;
      clause2Answer: string;
      clause3Answer: string;
      clause4Answer: string;
      submittedAt: string;
    };
    abdullah?: {
      idPhoto: string;
      residencePhoto: string;
      clause1Answer: string;
      clause2Answer: string;
      clause3Answer: string;
      clause4Answer: string;
      submittedAt: string;
    };
  }>({});

  // لحفظ حالات الشارة من قاعدة البيانات للموظفين
  const [dbBadges, setDbBadges] = useState<{ mohammed?: boolean; abdullah?: boolean }>({});

  // حالات شريط التنقل (الهامبرغر) والدردشة الحية
  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [openAdminChats, setOpenAdminChats] = useState<{ mohammed?: boolean; abdullah?: boolean }>({});
  const [adminReplyTexts, setAdminReplyTexts] = useState<{ [key: string]: string }>({ mohammed: "", abdullah: "" });

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
  const handleSecretToggle = async () => {
    const codeInput = window.prompt("اكتب كود الوزارة");
    
    // التحقق من صحة الكود المدخل
    if (codeInput === null) {
      // إذا قام المستخدم بإلغاء مربع الحوار
      return;
    }

    if (codeInput === "Gtasen1122" || codeInput === "Gtasen0909") {
      // كود صحيح: تفعيل أو إخفاء الشارة
      const newBadgeState = !badgeActive;
      setBadgeActive(newBadgeState);
      localStorage.setItem(`iraqi_media_badge_active_${selectedEmployee}`, String(newBadgeState));
      localStorage.setItem("iraqi_media_badge_active", String(newBadgeState));

      // حفظ في Firestore
      try {
        await setDoc(doc(db, "badges", selectedEmployee), {
          active: newBadgeState,
          updatedAt: new Date().toLocaleString("ar-IQ")
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `badges/${selectedEmployee}`);
      }
      loadSubmissions();
    } else {
      // كود خاطئ
      window.alert("الكود غير صحيح، لا تملك الصلاحية");
    }
  };

  // تتبع الموظف المحدد لشحن حالة الشارة والعقد الخاص به
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (isLoggedIn && selectedEmployee) {
        // تحميل حالة الشارة من Firestore أولاً ثم التراجع لـ localStorage
        try {
          const badgeDoc = await getDoc(doc(db, "badges", selectedEmployee));
          if (badgeDoc.exists()) {
            const badgeData = badgeDoc.data();
            setBadgeActive(badgeData.active === true);
          } else {
            const savedBadgeStatus = localStorage.getItem(`iraqi_media_badge_active_${selectedEmployee}`);
            if (savedBadgeStatus !== null) {
              setBadgeActive(savedBadgeStatus === "true");
            } else {
              const savedGlobalBadge = localStorage.getItem("iraqi_media_badge_active");
              setBadgeActive(savedGlobalBadge === "true");
            }
          }
        } catch (err) {
          console.warn("Failed to fetch badge status: ", err);
          const savedBadgeStatus = localStorage.getItem(`iraqi_media_badge_active_${selectedEmployee}`);
          if (savedBadgeStatus !== null) {
            setBadgeActive(savedBadgeStatus === "true");
          } else {
            const savedGlobalBadge = localStorage.getItem("iraqi_media_badge_active");
            setBadgeActive(savedGlobalBadge === "true");
          }
        }
        
        // شحن بيانات العقد للموظف إذا وجدت في Firestore أو تراجع لـ localStorage
        try {
          const contractDoc = await getDoc(doc(db, "contracts", selectedEmployee));
          if (contractDoc.exists()) {
            const contractData = contractDoc.data();
            setIdPhoto(contractData.idPhoto || null);
            setResidencePhoto(contractData.residencePhoto || null);
            setClause1Answer(contractData.clause1Answer || "");
            setClause2Answer(contractData.clause2Answer || "");
            setClause3Answer(contractData.clause3Answer || "");
            setClause4Answer(contractData.clause4Answer || "");
          } else {
            const contractDataStr = localStorage.getItem(`iraqi_media_contract_${selectedEmployee}`);
            if (contractDataStr) {
              const contractData = JSON.parse(contractDataStr);
              setIdPhoto(contractData.idPhoto || null);
              setResidencePhoto(contractData.residencePhoto || null);
              setClause1Answer(contractData.clause1Answer || "");
              setClause2Answer(contractData.clause2Answer || "");
              setClause3Answer(contractData.clause3Answer || "");
              setClause4Answer(contractData.clause4Answer || "");
            } else {
              setIdPhoto(null);
              setResidencePhoto(null);
              setClause1Answer("");
              setClause2Answer("");
              setClause3Answer("");
              setClause4Answer("");
            }
          }
        } catch (err) {
          console.warn("Failed to fetch contract data: ", err);
          const contractDataStr = localStorage.getItem(`iraqi_media_contract_${selectedEmployee}`);
          if (contractDataStr) {
            const contractData = JSON.parse(contractDataStr);
            setIdPhoto(contractData.idPhoto || null);
            setResidencePhoto(contractData.residencePhoto || null);
            setClause1Answer(contractData.clause1Answer || "");
            setClause2Answer(contractData.clause2Answer || "");
            setClause3Answer(contractData.clause3Answer || "");
            setClause4Answer(contractData.clause4Answer || "");
          }
        }
      }
    };
    fetchEmployeeData();
  }, [selectedEmployee, isLoggedIn]);

  // دالة جلب العقود لكل الموظفين وتحديث اللوحة الحية
  const loadSubmissions = async () => {
    let mohammedData = null;
    let abdullahData = null;
    try {
      const mohammedDoc = await getDoc(doc(db, "contracts", "mohammed"));
      const abdullahDoc = await getDoc(doc(db, "contracts", "abdullah"));
      mohammedData = mohammedDoc.exists() ? mohammedDoc.data() : null;
      abdullahData = abdullahDoc.exists() ? abdullahDoc.data() : null;
    } catch (err) {
      console.warn("Failed to load contracts from Firestore: ", err);
    }

    const localMohammed = localStorage.getItem("iraqi_media_contract_mohammed");
    const localAbdullah = localStorage.getItem("iraqi_media_contract_abdullah");

    setSubmissions({
      mohammed: mohammedData ? (mohammedData as any) : (localMohammed ? JSON.parse(localMohammed) : undefined),
      abdullah: abdullahData ? (abdullahData as any) : (localAbdullah ? JSON.parse(localAbdullah) : undefined),
    });

    // جلب الشارات أيضاً لربط اللوحة ببيانات حقيقية
    let mohammedBadge = false;
    let abdullahBadge = false;
    try {
      const mohammedBadgeDoc = await getDoc(doc(db, "badges", "mohammed"));
      const abdullahBadgeDoc = await getDoc(doc(db, "badges", "abdullah"));
      mohammedBadge = mohammedBadgeDoc.exists() ? mohammedBadgeDoc.data()?.active === true : false;
      abdullahBadge = abdullahBadgeDoc.exists() ? abdullahBadgeDoc.data()?.active === true : false;
    } catch (err) {
      console.warn("Failed to load badges from Firestore: ", err);
      mohammedBadge = localStorage.getItem("iraqi_media_badge_active_mohammed") === "true";
      abdullahBadge = localStorage.getItem("iraqi_media_badge_active_abdullah") === "true";
    }

    setDbBadges({
      mohammed: mohammedBadge,
      abdullah: abdullahBadge,
    });
  };

  // تحميل العقود عند التشغيل الأول
  useEffect(() => {
    loadSubmissions();
  }, []);

  // اشتراك حقيقي في دردشة الموظف الحالي
  useEffect(() => {
    if (!isLoggedIn || !selectedEmployee) return;

    const q = query(
      collection(db, "messages"),
      where("employeeId", "==", selectedEmployee),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: any[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push({ id: docSnap.id, ...docSnap.data() });
        });
        setChatMessages(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "messages");
      }
    );

    return () => unsubscribe();
  }, [isLoggedIn, selectedEmployee]);

  // اشتراك حقيقي في كافة الرسائل للوحة التحكم الخاصة بالمسؤول
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const q = query(
      collection(db, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: any[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push({ id: docSnap.id, ...docSnap.data() });
        });
        setAllMessages(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "messages");
      }
    );

    return () => unsubscribe();
  }, [isAdminLoggedIn]);

  // اشتراك حقيقي في دردشة المواطن الفيدرالي المباشر
  useEffect(() => {
    if (!isCitizenLoggedIn || !citizenUser) return;

    const q = query(
      collection(db, "messages"),
      where("employeeId", "==", "citizen_" + citizenUser.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: any[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push({ id: docSnap.id, ...docSnap.data() });
        });
        setCitizenChatMessages(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "messages");
      }
    );

    return () => unsubscribe();
  }, [isCitizenLoggedIn, citizenUser]);

  // دالة الدخول عبر جوجل للمواطنين
  const handleGoogleSignIn = async () => {
    setCitizenErrorMsg("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        setCitizenUser({
          uid: user.uid,
          displayName: user.displayName || "مواطن عراقي",
          email: user.email || "",
          photoURL: user.photoURL || ""
        });
        setIsCitizenLoggedIn(true);
        setLoginMode("select");
      }
    } catch (err: any) {
      console.error("Google Auth Error: ", err);
      if (err.code === "auth/popup-blocked") {
        setCitizenErrorMsg("تم حظر النافذة المنبثقة من قبل المتصفح. يرجى تفعيل النوافذ المنبثقة وحاول مرة أخرى.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setCitizenErrorMsg("تم إلغاء عملية تسجيل الدخول من قبل المستخدم.");
      } else if (err.code === "auth/unauthorized-domain" || (err.message && err.message.includes("auth/unauthorized-domain"))) {
        setCitizenErrorMsg(`خطأ النطاق غير المصرح به: يرجى إضافة النطاق الحالي (${window.location.hostname}) إلى قائمة النطاقات المصرح بها (Authorized Domains) في وحدة تحكم Firebase (Authentication -> Settings -> Authorized domains).`);
      } else {
        setCitizenErrorMsg(`فشل تسجيل الدخول عبر حساب جوجل: ${err.message || "يرجى التحقق من اتصالك بالإنترنت."}`);
      }
    }
  };

  // تسجيل خروج المواطن
  const handleCitizenLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.warn("Sign out warning: ", e);
    }
    setIsCitizenLoggedIn(false);
    setCitizenUser(null);
    setLoginMode("select");
  };

  // إرسال رسالة من قبل المواطن
  const handleSendCitizenMessage = async (text: string) => {
    if (!text.trim() || !citizenUser) return;

    try {
      await addDoc(collection(db, "messages"), {
        employeeId: "citizen_" + citizenUser.uid,
        sender: "citizen",
        senderName: citizenUser.displayName,
        senderEmail: citizenUser.email,
        senderPhoto: citizenUser.photoURL,
        text: text.trim(),
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" })
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "messages");
    }
  };

  // إرسال رد رسمي من المسؤول للمواطن
  const handleSendAdminReplyToCitizen = async (citizenId: string, text: string) => {
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        employeeId: citizenId,
        sender: "admin",
        text: text.trim(),
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" })
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "messages");
    }
  };

  // إرسال رسالة من قبل الموظف
  const handleSendEmployeeMessage = async () => {
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage("");

    try {
      await addDoc(collection(db, "messages"), {
        employeeId: selectedEmployee,
        sender: "employee",
        text,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" })
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "messages");
    }
  };

  // إرسال رسالة من قبل المسؤول (STS)
  const handleSendAdminMessage = async (empId: "mohammed" | "abdullah", text: string) => {
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        employeeId: empId,
        sender: "admin",
        text: text.trim(),
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" })
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "messages");
    }
  };

  // معالجة رفع الملفات وتحويلها لترميز Base64 لتخزينها
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "id" | "residence") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          if (type === "id") {
            setIdPhoto(reader.result);
          } else {
            setResidencePhoto(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة إرسال العقد
  const handleContractSubmit = async () => {
    if (!idPhoto) {
      setContractError("يرجى رفع صورة الهوية الوطنية أولاً.");
      return;
    }
    if (!residencePhoto) {
      setContractError("يرجى رفع صورة بطاقة السكن أولاً.");
      return;
    }
    if (!clause1Answer.trim()) {
      setContractError("يرجى كتابة إقرارك بالالتزام بالبند الأول.");
      return;
    }
    if (!clause2Answer.trim()) {
      setContractError("يرجى كتابة إقرارك بالالتزام بالبند الثاني.");
      return;
    }
    if (!clause3Answer.trim()) {
      setContractError("يرجى كتابة إقرارك بالالتزام بالبند الثالث.");
      return;
    }
    if (!clause4Answer.trim()) {
      setContractError("يرجى كتابة الإجابة والموافقة النهائية للبند الرابع.");
      return;
    }

    const submissionData = {
      idPhoto,
      residencePhoto,
      clause1Answer,
      clause2Answer,
      clause3Answer,
      clause4Answer,
      submittedAt: new Date().toLocaleString("ar-IQ"),
    };

    localStorage.setItem(`iraqi_media_contract_${selectedEmployee}`, JSON.stringify(submissionData));

    // حفظ في Firestore مع معالجة الخطأ القياسي
    try {
      await setDoc(doc(db, "contracts", selectedEmployee), submissionData);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `contracts/${selectedEmployee}`);
    }

    await loadSubmissions();
    setShowContractSuccess(true);
    setContractError("");
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

      {/* صفحة تسجيل الدخول الأمنية */}
      {!showSplash && !isLoggedIn && !isAdminLoggedIn && !isCitizenLoggedIn && (
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-[#020617] via-[#091122] to-[#020617] min-h-screen relative overflow-hidden w-full">
          {/* خلفيات إضاءة نيون خافتة لتأثير عمق متطور */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/[0.04] blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/[0.03] blur-[150px] pointer-events-none"></div>

          {/* زخارف أمنية مائية */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center">
            <img
              src={iraqiEmblem}
              alt="شعار مائي"
              className="w-[600px] h-[600px] object-contain select-none"
              referrerPolicy="no-referrer"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-slate-700/50 transition-all duration-500 relative z-10"
            dir="rtl"
          >
            {/* زخرفة الزوايا الذهبية المتطورة */}
            <div className="absolute top-0 right-0 w-20 h-[2px] bg-gradient-to-l from-amber-500/50 to-transparent"></div>
            <div className="absolute top-0 right-0 h-20 w-[2px] bg-gradient-to-b from-amber-500/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-20 h-[2px] bg-gradient-to-r from-amber-500/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 h-20 w-[2px] bg-gradient-to-t from-amber-500/50 to-transparent"></div>

            {/* الهيدر الأمني للوجين */}
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl"></div>
                <img
                  src={iraqiEmblem}
                  alt="شعار جمهورية العراق"
                  className="w-24 h-24 object-cover rounded-full border border-amber-500/30 p-1.5 bg-slate-950/80 shadow-2xl relative z-10 transition-transform duration-500 hover:rotate-6"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">بوابة الأفراد الأمنية الموحدة</h2>
                <p className="text-xs text-slate-400 font-medium tracking-wide mt-1.5">جمهورية العراق - هيئة الإعلام والاتصالات</p>
              </div>
            </div>

            {loginMode === "select" ? (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setLoginMode("employee_code");
                    setLoginError("");
                    setCitizenError(false);
                  }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <User className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span>تسجيل الدخول كموظف رسمي</span>
                  </span>
                  <CheckCircle2 className="w-5 h-5 opacity-80" />
                </button>

                <button
                  onClick={() => {
                    setLoginMode("citizen_postal");
                    setCitizenPostalCode("");
                    setCitizenErrorMsg("");
                  }}
                  className="w-full py-4 px-6 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-200 font-extrabold text-sm rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 shrink-0 text-slate-400 transition-transform duration-300 group-hover:scale-110" />
                    <span>تسجيل الدخول كمواطن عراقي</span>
                  </span>
                  <Compass className="w-5 h-5 text-slate-500" />
                </button>

                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-slate-800/80"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">صلاحيات الإدارة الفيدرالية</span>
                  <div className="flex-grow border-t border-slate-800/80"></div>
                </div>

                <button
                  onClick={() => {
                    setLoginMode("admin_login" as any);
                    setAdminPasswordInput("");
                    setAdminLoginError("");
                  }}
                  className="w-full py-3.5 px-6 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 font-extrabold text-xs rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <Key className="w-4 h-4 shrink-0 text-red-500 group-hover:scale-110 transition-transform duration-300" />
                    <span>مسؤول إداري (لوحة تحكم STS)</span>
                  </span>
                  <Lock className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            ) : loginMode === "employee_code" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-300 block text-right pr-1">
                    أدخل كود الموظف الوزاري للدخول الموحد
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={loginCode}
                      onChange={(e) => {
                        setLoginCode(e.target.value);
                        setLoginError("");
                      }}
                      placeholder="Gtasen••••"
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 rounded-2xl py-3.5 px-4 text-center font-mono font-bold tracking-widest text-amber-400 text-sm focus:outline-none transition-all duration-300 placeholder-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                      dir="ltr"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-650 transition-colors duration-350 group-focus-within:text-amber-500" />
                  </div>
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-2xl leading-relaxed text-right flex items-center gap-2.5 shadow-md"
                  >
                    <X className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{loginError}</span>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => {
                      setLoginMode("select");
                      setLoginCode("");
                      setLoginError("");
                    }}
                    className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-300 font-extrabold text-xs rounded-xl transition-all duration-300 cursor-pointer hover:shadow-md"
                  >
                    العودة للخلف
                  </button>

                  <button
                    onClick={() => {
                      if (loginCode === "Gtasen1122") {
                        setSelectedEmployee("mohammed");
                        setIsLoggedIn(true);
                      } else if (loginCode === "Gtasen0909") {
                        setSelectedEmployee("abdullah");
                        setIsLoggedIn(true);
                      } else {
                        setLoginError("الكود المدخل غير صحيح، يرجى التأكد من الكود الوزاري المخصص لك.");
                      }
                    }}
                    className="flex-[2] py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-[0.98] cursor-pointer"
                  >
                    دخول النظام والتحقق
                  </button>
                </div>
              </div>
            ) : loginMode === ("admin_login" as any) ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-300 block text-right pr-1">
                    يرجى إدخال رمز المسؤول STS للمتابعة
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={adminPasswordInput}
                      onChange={(e) => {
                        setAdminPasswordInput(e.target.value);
                        setAdminLoginError("");
                      }}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 rounded-2xl py-3.5 px-4 text-center font-mono font-bold tracking-widest text-amber-400 text-sm focus:outline-none transition-all duration-300 placeholder-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
                      dir="ltr"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (adminPasswordInput === "Gtasen1122@MN") {
                            setIsAdminLoggedIn(true);
                            setShowAdminPanel(true);
                            setAdminPasswordInput("");
                          } else {
                            setAdminLoginError("الرمز السري غير صحيح، يرجى المحاولة مرة أخرى.");
                          }
                        }
                      }}
                    />
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-650 transition-colors duration-350 group-focus-within:text-amber-500" />
                  </div>
                </div>

                {adminLoginError && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-2xl leading-relaxed text-right flex items-center gap-2.5 shadow-md"
                  >
                    <X className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{adminLoginError}</span>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => {
                      setLoginMode("select");
                      setAdminPasswordInput("");
                      setAdminLoginError("");
                    }}
                    className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-300 font-extrabold text-xs rounded-xl transition-all duration-300 cursor-pointer hover:shadow-md"
                  >
                    العودة للخلف
                  </button>

                  <button
                    onClick={() => {
                      if (adminPasswordInput === "Gtasen1122@MN") {
                        setIsAdminLoggedIn(true);
                        setShowAdminPanel(true);
                        setAdminPasswordInput("");
                      } else {
                        setAdminLoginError("الرمز السري غير صحيح، يرجى المحاولة مرة أخرى.");
                      }
                    }}
                    className="flex-[2] py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-[0.98] cursor-pointer"
                  >
                    دخول المسؤول
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-3 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <ShieldCheck className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-400">تسجيل دخول آمن للمواطنين</h3>
                    <p className="text-[10px] text-slate-500 mt-1 tracking-wide">حماية مطلقة لبيانات الهوية الفيدرالية</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-850/80 rounded-2xl text-[11px] text-slate-400 leading-relaxed text-right shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                  للدخول بأمان وتصفح النشرات الحصرية ومراسلة الإدارة الفيدرالية بشكل مباشر، يرجى النقر على الزر أدناه لتسجيل الدخول الفوري والآمن باستخدام حساب Google الخاص بك.
                </div>

                {citizenErrorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] rounded-2xl leading-relaxed text-right flex items-center gap-2.5 shadow-md"
                  >
                    <X className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{citizenErrorMsg}</span>
                  </motion.div>
                )}

                <div className="space-y-3 pt-1">
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,255,255,0.12)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 border border-slate-200"
                  >
                    {/* Google Icon Vector */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>تسجيل الدخول الفوري الآمن عبر Google</span>
                  </button>

                  <button
                    onClick={() => {
                      setLoginMode("select");
                      setCitizenPostalCode("");
                      setCitizenErrorMsg("");
                    }}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-300 font-extrabold text-xs rounded-xl transition-all duration-300 cursor-pointer shadow-md"
                  >
                    العودة للخلف
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-slate-900 text-center text-[10px] text-slate-500 font-mono tracking-widest">
              SECURE AUTHORIZATION SYSTEM v2.7
            </div>
          </motion.div>
        </div>
      )}

      {/* الجزء الثاني والثالث: واجهة المستخدم الرئيسية (Dashboard) */}
      {!showSplash && isLoggedIn && (
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
        <header className="gov-glass border-b border-emerald-500/20 backdrop-blur-md py-4 px-6 sticky top-0 z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* الشعار والاسم الرسمي */}
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
                <h2 className="font-serif font-black text-xl text-amber-400 leading-snug text-gold-gradient">
                  جمهورية العراق
                </h2>
                <p className="text-xs text-slate-300 font-extrabold tracking-wide mt-1">
                  هيئة الإعلام والاتصالات - البوابة الرقمية الموحدة
                </p>
              </div>
            </div>

            {/* الوقت والتاريخ الفعلي */}
            <div className="flex items-center gap-4 text-xs">
              <div className="bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-slate-300 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="font-mono font-medium">{currentTime || "00:00:00"}</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl hidden sm:flex items-center gap-2 text-slate-300 shadow-inner">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium">{currentDate || "جاري جلب التاريخ..."}</span>
              </div>
              <div className="bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 text-emerald-400 font-black text-[10px] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 exam-indicator-glow"></span>
                <span>متصل بالشبكة الحكومية</span>
              </div>
            </div>

            {/* زر القائمة هامبرغر (3 خطوط) على الجانب الأيسر يجمع الخيارات المطلوبة */}
            <div className="flex items-center gap-3">
              {(() => {
                const lastMsg = chatMessages[chatMessages.length - 1];
                const hasUnreadReplies = lastMsg && lastMsg.sender === "admin" && !showChat;
                return (
                  <button
                    onClick={() => setShowMenu(true)}
                    className="px-4 py-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 font-bold text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-2 relative active:scale-95 shadow-lg shadow-slate-950/40"
                    title="القائمة الإلكترونية الموحدة"
                  >
                    <Menu className="w-4 h-4 text-amber-500" />
                    <span>خدمات البوابة</span>
                    
                    {/* Glowing notification badge if has unread messages */}
                    {hasUnreadReplies && (
                      <span className="absolute -top-1 -left-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                  </button>
                );
              })()}
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

          {/* صندوق حالة التدريب الامتحاني المتميز والمضيء */}
          <div className="w-full max-w-xl text-right" dir="rtl">
            <div className="w-full p-5 gov-card-emerald rounded-2xl shadow-xl flex items-center justify-between gap-4 relative overflow-hidden transition-all duration-300">
              {/* توهج خفيف بالخلفية */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full filter blur-xl pointer-events-none animate-pulse"></div>
              
              <div className="flex items-center gap-4">
                {/* الضوء الأخضر النابض التفاعلي المطور */}
                <div className="relative flex h-4 w-4 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 exam-indicator-glow"></span>
                </div>
                
                <div className="text-right">
                  <h4 className="text-sm sm:text-base font-black text-emerald-400 tracking-wide">
                    تحت التدريب الامتحاني
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                    هذا الحساب معتمد ويخضع حالياً لبرنامج التدريب والاختبار المهني المستمر.
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end text-[9px] text-emerald-500/50 font-mono tracking-wider leading-relaxed shrink-0 select-none">
                <span>STATUS: TRAINING</span>
                <span>SYSTEM: EXAM_V2</span>
              </div>
            </div>
          </div>

          {/* زر/مربع استلام الراتب المتناسق */}
          <div className="w-full max-w-xl text-right mt-4" dir="rtl">
            <button
              onClick={() => setShowBankIframe(true)}
              className="w-full p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl shadow-xl flex items-center justify-between gap-4 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group text-right"
            >
              {/* توهج خفيف بالخلفية عند التحويم */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.02] group-hover:bg-amber-500/[0.04] rounded-full filter blur-xl pointer-events-none transition-all duration-300"></div>
              
              <div className="flex items-center gap-4">
                {/* أيقونة المحفظة الذهبية الفخمة */}
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-all duration-300">
                  <Wallet className="w-5 h-5" />
                </div>
                
                <div className="text-right">
                  <h4 className="text-sm sm:text-base font-black text-amber-400 tracking-wide group-hover:text-amber-300 transition-colors">
                    استلام الراتب المستحق
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                    انقر هنا للانتقال إلى بوابة الصرف الإلكتروني وتلقي المستحقات المالية الرسمية.
                  </p>
                </div>
              </div>

              {/* سهم جانبي أنيق للتوجيه */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[10px] text-amber-500/60 font-mono tracking-widest">
                  PAYMENT PORTAL
                </span>
                <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform rotate-180" />
              </div>
            </button>
          </div>

          {/* زر دائري فاخر ومضيء لتحميل الكتب والملازم للامتحان لكلا الموظفين */}
          <div className="w-full max-w-xl flex justify-center mt-6 mb-4" dir="rtl">
            <button
              onClick={() => setShowBooksIframe(true)}
              className="flex flex-col items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              {/* زر دائري متألق بنمط النبض الأخضر الزمردي المتطور */}
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-400/40 transition-all duration-300 transform group-hover:scale-110 active:scale-95">
                {/* هالة النبض المتوهجة */}
                <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-md opacity-70 group-hover:opacity-100 animate-ping duration-1000"></div>
                <BookOpen className="w-7 h-7 relative z-10 text-slate-950 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              
              {/* التسمية الفخمة المتناسقة تحت الزر */}
              <span className="text-xs font-black text-emerald-400 group-hover:text-emerald-300 transition-colors text-center max-w-[280px] leading-relaxed drop-shadow-md">
                انقر هنا لتنزيل الكتب والملازم للاختبار
              </span>
            </button>
          </div>

          {/* بطاقة الموظف التعريفية */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-xl gov-card-gold rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-500"
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
                    <span>{selectedEmployee === "mohammed" ? "محمد حمزة عباس" : "عبد الله حيدر عباس"}</span>
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
                    <span className="font-semibold text-slate-200">
                      {selectedEmployee === "mohammed" 
                        ? "مسؤول استقبال ملفات صادرة و واردة" 
                        : "اعلامي - مسؤول تجميع اعلام الكتروني"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">الراتب الشهري</span>
                    </div>
                    <span className="font-semibold text-slate-200">
                      {selectedEmployee === "mohammed" 
                        ? "600,000 – 650,000 دينار عراقي لا غير" 
                        : "850 الف دينار لا غير"}
                    </span>
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
                    <span className="font-bold text-emerald-500 text-xs sm:text-sm text-right leading-relaxed max-w-xs flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>تم تسديد جميع الرسوم</span>
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

                  {/* الحالة التوظيفية تحت التدريب بلون أخضر معتمد */}
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FileBadge className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-xs">الحالة التوظيفية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-lg border border-emerald-500/50 bg-emerald-950/80 text-emerald-400 transition-all duration-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 exam-indicator-glow animate-pulse"></span>
                        <span>تحت التدريب</span>
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
              
              {/* باركود أمني مصمم بالـ CSS للتحقق من الهوية */}
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
      )}

      {/* الجزء الرابع: واجهة التحكم الكاملة المنفصلة للمسؤول الإداري (STS) */}
      {!showSplash && isAdminLoggedIn && (
        <div className="flex-1 flex flex-col relative bg-slate-950 min-h-screen">
          {/* خلفية فخمة للوحة التحكم */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
            <img
              src={iraqiEmblem}
              alt="شعار مائي"
              className="w-[600px] h-[600px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* الهيدر الرئاسي الفيدرالي للوحة التحكم */}
          <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-amber-500/30 px-6 py-4" dir="rtl">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <img src={iraqiEmblem} alt="شعار جمهورية العراق" className="w-14 h-14 object-cover rounded-full border border-amber-500/20 p-0.5 bg-slate-900" referrerPolicy="no-referrer" />
                <div className="text-right">
                  <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 font-serif">
                    لوحة التحكم المركزية الآمنة للمسؤول - STS
                  </h1>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">
                    REPUBLIC OF IRAQ • FEDERAL PRESIDENCY AND SECURITY CONTROL PANEL
                  </p>
                </div>
              </div>

              {/* عناصر التحكم والتوقيت والرمز الفدرالي */}
              <div className="flex items-center gap-4 flex-wrap justify-center">
                {/* شارة المسؤول */}
                <div className="bg-red-950/40 text-red-400 border border-red-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>مسؤول فيدرالي معتمد</span>
                </div>

                {/* زر الخروج الآمن */}
                <button
                  onClick={() => {
                    setIsAdminLoggedIn(false);
                    setLoginMode("select");
                    setAdminPasswordInput("");
                    setAdminLoginError("");
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-xl transition duration-300 shadow-lg hover:shadow-red-600/20 active:scale-95 flex items-center gap-1.5 cursor-pointer animate-none"
                >
                  <span>تسجيل خروج المسؤول</span>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8" dir="rtl">
            {/* بطاقة توجيه الأمن الفيدرالي */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-950 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Key className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-black text-amber-400">منظومة الإدارة والمراسلة المباشرة</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    ترحب بكم المنظومة الفيدرالية الآمنة. يمكنك تفعيل هويات الموظفين، مراجعة ملفاتهم، والدردشة معهم بشكل حقيقي وفوري.
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                STS-NODE: active_online
              </span>
            </div>

            {/* شبكة بانتو لعرض وإدارة الموظفين */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                { id: "mohammed" as const, name: "محمد حمزة عباس" },
                { id: "abdullah" as const, name: "عبد الله حيدر عباس" }
              ].map((emp) => {
                const sub = submissions[emp.id];
                const empBadgeActive = dbBadges[emp.id] ?? (localStorage.getItem(`iraqi_media_badge_active_${emp.id}`) === "true");
                
                return (
                  <div key={emp.id} className="bg-gradient-to-b from-slate-900 to-[#0c1421] rounded-2xl border border-slate-800 p-6 flex flex-col h-full shadow-2xl relative overflow-hidden">
                    {/* لمعة زاوية */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>

                    {/* معلومات الموظف وتفعيل الشارة */}
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold text-slate-200 text-sm">{emp.name}</h3>
                          <span className="text-[9px] text-slate-500 font-mono block mt-0.5">وزاري: {emp.id === "mohammed" ? "Gtasen1122" : "Gtasen0909"}</span>
                        </div>
                      </div>

                      {sub ? (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2.5 py-1 rounded-full">
                          تم رفع الثبوتيات ({sub.submittedAt})
                        </span>
                      ) : (
                        <span className="bg-amber-950/30 text-amber-500 border border-amber-500/20 text-[9px] font-black px-2.5 py-1 rounded-full animate-pulse">
                          بانتظار رفع الثبوتيات
                        </span>
                      )}
                    </div>

                    {/* عرض البيانات المرفوعة */}
                    {sub ? (
                      <div className="space-y-4 text-xs flex-1">
                        {/* صور الثبوتيات */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-1">صورة الهوية الوطنية:</span>
                            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 group relative">
                              <img src={sub.idPhoto} alt="National ID" className="w-full h-28 object-cover" />
                              <a
                                href={sub.idPhoto}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-[10px] font-bold text-white cursor-pointer gap-1"
                              >
                                <Eye className="w-4 h-4" /> عرض كامل
                              </a>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-1">صورة بطاقة السكن:</span>
                            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 group relative">
                              <img src={sub.residencePhoto} alt="Residence Card" className="w-full h-28 object-cover" />
                              <a
                                href={sub.residencePhoto}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-[10px] font-bold text-white cursor-pointer gap-1"
                              >
                                <Eye className="w-4 h-4" /> عرض كامل
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* إجابات البنود */}
                        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 space-y-2.5">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block">إقرار البند الأول (المباشرة بالعمل):</span>
                            <p className="text-slate-200 mt-0.5">{sub.clause1Answer}</p>
                          </div>
                          <div className="border-t border-slate-850 pt-2.5">
                            <span className="text-[10px] text-slate-400 font-bold block">إقرار البند الثاني (الرسوم):</span>
                            <p className="text-slate-200 mt-0.5">{sub.clause2Answer}</p>
                          </div>
                          <div className="border-t border-slate-850 pt-2.5">
                            <span className="text-[10px] text-slate-400 font-bold block">إقرار البند الثالث (البريد الإلكتروني):</span>
                            <p className="text-slate-200 mt-0.5">{sub.clause3Answer}</p>
                          </div>
                          <div className="border-t border-slate-850 pt-2.5">
                            <span className="text-[10px] text-slate-400 font-bold block">الإجابة والموافقة النهائية (البند الرابع):</span>
                            <p className="text-slate-200 mt-0.5 font-bold text-amber-400">{sub.clause4Answer}</p>
                          </div>
                        </div>

                        {/* أزرار الإدارة التفاعلية */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={async () => {
                              const nextStatus = !empBadgeActive;
                              localStorage.setItem(`iraqi_media_badge_active_${emp.id}`, String(nextStatus));
                              if (selectedEmployee === emp.id) {
                                setBadgeActive(nextStatus);
                              }
                              try {
                                await setDoc(doc(db, "badges", emp.id), {
                                  active: nextStatus,
                                  updatedAt: new Date().toLocaleString("ar-IQ")
                                });
                              } catch (err) {
                                handleFirestoreError(err, OperationType.WRITE, `badges/${emp.id}`);
                              }
                              loadSubmissions();
                            }}
                            className={`flex-1 py-2.5 px-3 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                              empBadgeActive
                                ? "bg-emerald-950 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900"
                                : "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-600/30"
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>
                              {empBadgeActive ? "إلغاء تفعيل الشارة" : "تفعيل الشارة والموافقة الفورية"}
                            </span>
                          </button>

                          <button
                            onClick={async () => {
                              if (window.confirm(`هل أنت متأكد من رغبتك في حذف وإعادة تعيين العقد لـ ${emp.name}؟`)) {
                                localStorage.removeItem(`iraqi_media_contract_${emp.id}`);
                                try {
                                  await deleteDoc(doc(db, "contracts", emp.id));
                                } catch (err) {
                                  console.warn("Failed to delete contract from Firestore: ", err);
                                }
                                loadSubmissions();
                                if (selectedEmployee === emp.id) {
                                  setIdPhoto(null);
                                  setResidencePhoto(null);
                                  setClause1Answer("");
                                  setClause2Answer("");
                                  setClause3Answer("");
                                  setClause4Answer("");
                                }
                              }
                            }}
                            className="px-3.5 py-2.5 bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                            title="حذف البيانات وإعادة التجربة"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>إعادة تعيين</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500 bg-slate-950/40 border border-slate-850 rounded-xl">
                        <FileText className="w-10 h-10 text-slate-700 mb-2" />
                        <span className="text-xs font-bold">لا توجد بيانات مرفوعة مسبقاً لهذا الموظف</span>
                        <span className="text-[10px] text-slate-600 mt-1">بانتظار أن يقوم الموظف برفع مستنداته وإنشاء العقد.</span>
                      </div>
                    )}

                    {/* نظام المراسلة والدردشة الحية الفوري */}
                    <div className="border-t border-slate-800/80 pt-4 mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-amber-500 animate-pulse" />
                        <h4 className="text-xs font-bold text-slate-300">مركز المراسلة الفورية الرسمي مع {emp.name}</h4>
                      </div>

                      {/* نافذة المحادثة */}
                      <div className="bg-slate-950 rounded-xl border border-slate-850 p-3.5 space-y-3">
                        <div className="h-48 overflow-y-auto space-y-2.5 p-2 bg-slate-900/40 rounded-lg border border-slate-900 flex flex-col">
                          {(() => {
                            const empMsgs = allMessages.filter(m => m.employeeId === emp.id);
                            if (empMsgs.length === 0) {
                              return (
                                <div className="my-auto text-center text-[10px] text-slate-600">
                                  لا توجد رسائل متبادلة مع هذا الموظف بعد.
                                </div>
                              );
                            }
                            return empMsgs.map((msg) => {
                              const isAdmin = msg.sender === "admin";
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col max-w-[85%] ${
                                    isAdmin ? "self-start items-start" : "self-end items-end"
                                  }`}
                                >
                                  <div
                                    className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                                      isAdmin
                                        ? "bg-slate-800 text-slate-200 rounded-tr-none border border-slate-700"
                                        : "bg-amber-500 text-slate-950 rounded-tl-none font-bold"
                                    }`}
                                  >
                                    {msg.text}
                                  </div>
                                  <span className="text-[8px] text-slate-600 mt-0.5 px-1 font-mono">{msg.time}</span>
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* حقل الإدخال والإرسال للمسؤول */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={adminReplyTexts[emp.id] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAdminReplyTexts(prev => ({ ...prev, [emp.id]: val }));
                            }}
                            placeholder={`اكتب ردك الرسمي إلى الموظف ${emp.name}...`}
                            className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500/35 rounded-lg py-2 px-3 text-[11px] text-slate-200 focus:outline-none transition-all placeholder-slate-700"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const text = adminReplyTexts[emp.id] || "";
                                handleSendAdminMessage(emp.id, text);
                                setAdminReplyTexts(prev => ({ ...prev, [emp.id]: "" }));
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const text = adminReplyTexts[emp.id] || "";
                              handleSendAdminMessage(emp.id, text);
                              setAdminReplyTexts(prev => ({ ...prev, [emp.id]: "" }));
                            }}
                            className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition duration-200 active:scale-95 flex items-center justify-center cursor-pointer shrink-0"
                          >
                            <Send className="w-3.5 h-3.5 transform rotate-180" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* قسم إدارة تواصل ومراسلات المواطنين الموثقين عبر حسابات Google */}
            <div className="bg-gradient-to-b from-slate-900 to-[#0c1421] rounded-2xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden mt-8">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>

              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-6 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-slate-200 text-sm">قسم مراسلات وتواصل المواطنين (توثيق Google)</h3>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">CITIZEN INQUIRY & COMMUNICATIONS MANAGER</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-bold">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span>متصل حقيقياً بقاعدة البيانات</span>
                </div>
              </div>

              {(() => {
                const citizenMsgs = allMessages.filter(m => m.employeeId && m.employeeId.startsWith("citizen_"));
                const citizenIds = Array.from(new Set(citizenMsgs.map(m => m.employeeId)));
                
                if (citizenIds.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 bg-slate-950/40 border border-slate-850 rounded-xl">
                      <MessageSquare className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                      <span className="text-xs font-bold text-slate-300">لا توجد مراسلات من المواطنين بعد</span>
                      <span className="text-[10px] text-slate-600 mt-1">تظهر هنا الرسائل المرسلة من المواطنين بعد تسجيل دخولهم الموثق عبر جوجل.</span>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[450px]">
                    {/* قائمة المواطنين النشطين */}
                    <div className="md:col-span-1 bg-slate-950/60 rounded-xl border border-slate-850/80 p-3 overflow-y-auto space-y-2.5 h-full">
                      <span className="text-[10px] text-slate-500 font-bold block mb-2 px-1">محادثات المواطنين النشطة:</span>
                      {citizenIds.map(id => {
                        const citizenAllMsgs = citizenMsgs.filter(m => m.employeeId === id);
                        const firstCitMsg = citizenAllMsgs.find(m => m.sender === "citizen");
                        const lastMsg = citizenAllMsgs[citizenAllMsgs.length - 1];
                        const name = firstCitMsg?.senderName || "مواطن عراقي";
                        const email = firstCitMsg?.senderEmail || "بريد غير متوفر";
                        const photo = firstCitMsg?.senderPhoto || "";
                        const isActive = activeCitizenChatId === id;

                        return (
                          <button
                            key={id}
                            onClick={() => setActiveCitizenChatId(id)}
                            className={`w-full text-right p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                              isActive
                                ? "bg-amber-500/10 border-amber-500/40"
                                : "bg-slate-900/60 border-slate-850/60 hover:bg-slate-900"
                            }`}
                          >
                            <div className="relative shrink-0">
                              {photo ? (
                                <img src={photo} alt={name} className="w-10 h-10 rounded-full border border-slate-800 object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                                  <User className="w-5 h-5" />
                                </div>
                              )}
                              {lastMsg && lastMsg.sender === "citizen" && (
                                <span className="absolute -top-0.5 -left-0.5 flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-200 text-xs truncate">{name}</h4>
                              <p className="text-[9px] text-slate-500 font-mono truncate">{email}</p>
                              {lastMsg && (
                                <p className="text-[10px] text-slate-400 truncate mt-1 leading-snug">
                                  {lastMsg.sender === "admin" ? "أنت: " : ""}{lastMsg.text}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* نافذة المحادثة للمواطن المحدد */}
                    <div className="md:col-span-2 bg-slate-950/40 rounded-xl border border-slate-850/80 p-4 flex flex-col h-full overflow-hidden">
                      {activeCitizenChatId ? (
                        (() => {
                          const activeCitMsgs = citizenMsgs.filter(m => m.employeeId === activeCitizenChatId);
                          const firstCitMsg = activeCitMsgs.find(m => m.sender === "citizen");
                          const name = firstCitMsg?.senderName || "مواطن عراقي";
                          const email = firstCitMsg?.senderEmail || "";
                          const photo = firstCitMsg?.senderPhoto || "";

                          return (
                            <>
                              {/* ترويسة محادثة المواطن */}
                              <div className="flex items-center gap-3 border-b border-slate-850/80 pb-3 mb-3 justify-between">
                                <div className="flex items-center gap-2.5">
                                  {photo ? (
                                    <img src={photo} alt={name} className="w-8 h-8 rounded-full border border-slate-800 object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                                      <User className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-extrabold text-white text-xs">{name}</h4>
                                    <span className="text-[9px] text-slate-500 font-mono block leading-none mt-0.5">{email}</span>
                                  </div>
                                </div>

                                <span className="text-[9px] text-slate-500 bg-slate-950 border border-slate-850 py-0.5 px-2 rounded font-mono">
                                  {activeCitizenChatId.replace("citizen_", "")}
                                </span>
                              </div>

                              {/* قائمة الرسائل */}
                              <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-950/60 rounded-lg border border-slate-900 flex flex-col">
                                {activeCitMsgs.map(msg => {
                                  const isAdmin = msg.sender === "admin";
                                  return (
                                    <div
                                      key={msg.id}
                                      className={`flex flex-col max-w-[85%] ${
                                        isAdmin ? "self-start items-start" : "self-end items-end"
                                      }`}
                                    >
                                      <div
                                        className={`p-3 rounded-xl text-xs leading-relaxed ${
                                          isAdmin
                                            ? "bg-slate-800 text-slate-200 rounded-tr-none border border-slate-700"
                                            : "bg-amber-500 text-slate-950 rounded-tl-none font-bold shadow-md"
                                        }`}
                                      >
                                        {msg.text}
                                      </div>
                                      <span className="text-[8px] text-slate-600 mt-0.5 px-1 font-mono">{msg.time}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* مدخل الرسائل للرد */}
                              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-850/50">
                                <input
                                  type="text"
                                  value={adminReplyTexts[activeCitizenChatId] || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setAdminReplyTexts(prev => ({ ...prev, [activeCitizenChatId]: val }));
                                  }}
                                  placeholder={`اكتب ردك الرسمي الفيدرالي إلى المواطن ${name}...`}
                                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500/35 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-700"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const text = adminReplyTexts[activeCitizenChatId] || "";
                                      handleSendAdminReplyToCitizen(activeCitizenChatId, text);
                                      setAdminReplyTexts(prev => ({ ...prev, [activeCitizenChatId]: "" }));
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const text = adminReplyTexts[activeCitizenChatId] || "";
                                    handleSendAdminReplyToCitizen(activeCitizenChatId, text);
                                    setAdminReplyTexts(prev => ({ ...prev, [activeCitizenChatId]: "" }));
                                  }}
                                  className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition duration-200 active:scale-95 flex items-center justify-center cursor-pointer shrink-0"
                                >
                                  <Send className="w-3.5 h-3.5 transform rotate-180" />
                                </button>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <div className="my-auto text-center py-12 text-slate-500">
                          <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-2 animate-pulse" />
                          <span className="text-xs font-bold block">يرجى اختيار مواطن من القائمة الجانبية</span>
                          <span className="text-[10px] text-slate-600 mt-1">لرؤية سجل المحادثة الكاملة وإرسال رد رسمي إليه.</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </main>

          {/* تذييل صفحة المسؤول */}
          <footer className="bg-slate-950 border-t border-slate-900/80 py-6 text-center text-xs text-slate-500 mt-auto">
            <div className="max-w-7xl mx-auto px-6 space-y-2">
              <p className="font-semibold text-slate-400 font-serif text-sm">
                جمهورية العراق - هيئة الصحافة والإعلام والاتصالات الفيدرالية
              </p>
              <p className="text-[11px] text-slate-500">
                جميع الحقوق محفوظة © {new Date().getFullYear()} هـ.إ.ع. لوحة التحكم الآمنة STS
              </p>
            </div>
          </footer>
        </div>
      )}

      {/* عقد اتفاق وبدء مباشر للموظفين الجدد */}
      <AnimatePresence>
        {showContractModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-[#0d1520] to-slate-950 border border-slate-800 rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
              dir="rtl"
            >
              {/* ترويسة المودال */}
              <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/85 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <FileBadge className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span className="font-serif font-bold text-sm text-amber-400">
                    عقد اتفاق وبدء مباشر للموظفين الجدد
                  </span>
                </div>
                <button
                  onClick={() => setShowContractModal(false)}
                  className="p-1 rounded-full bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* محتوى المودال القابل للتمرير */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
                
                {!showContractSuccess ? (
                  <>
                    <p className="text-xs text-slate-300 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60 leading-relaxed text-justify">
                      أهلاً بك في هيئة الإعلام الإلكتروني. يُرجى قراءة البنود التالية بدقة واستكمال البيانات المطلوبة لإتمام إجراءات تعيينك:
                    </p>

                    {/* رفع الثبوتيات */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-400 block pr-1 text-right">الرجاء إرفاق المستندات الرسمية اللازمة:</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* صورة الهوية */}
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center space-y-3 relative group">
                          <span className="text-xs font-bold text-slate-300">صورة الهوية الوطنية</span>
                          {idPhoto ? (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-amber-500/30 bg-slate-950 flex items-center justify-center">
                              <img src={idPhoto} alt="ID Photo" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setIdPhoto(null)}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-500 rounded-full text-white transition cursor-pointer shadow-lg"
                                title="حذف الصورة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="w-full h-32 border-2 border-dashed border-slate-805 hover:border-amber-500/50 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer transition bg-slate-950/20 group">
                              <Upload className="w-8 h-8 text-slate-500 group-hover:text-amber-500 transition mb-2" />
                              <span className="text-xs text-slate-400 group-hover:text-slate-200 transition">انقر أو اسحب لرفع الهوية</span>
                              <span className="text-[9px] text-slate-600 mt-1 font-mono">PNG, JPG (MAX: 5MB)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "id")}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* صورة بطاقة السكن */}
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center space-y-3 relative group">
                          <span className="text-xs font-bold text-slate-300">صورة بطاقة السكن</span>
                          {residencePhoto ? (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-amber-500/30 bg-slate-950 flex items-center justify-center">
                              <img src={residencePhoto} alt="Residence Photo" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setResidencePhoto(null)}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-500 rounded-full text-white transition cursor-pointer shadow-lg"
                                title="حذف الصورة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="w-full h-32 border-2 border-dashed border-slate-805 hover:border-amber-500/50 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer transition bg-slate-950/20 group">
                              <Upload className="w-8 h-8 text-slate-500 group-hover:text-amber-500 transition mb-2" />
                              <span className="text-xs text-slate-400 group-hover:text-slate-200 transition">انقر أو اسحب لرفع بطاقة السكن</span>
                              <span className="text-[9px] text-slate-600 mt-1 font-mono">PNG, JPG (MAX: 5MB)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "residence")}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* البنود والأسئلة */}
                    <div className="space-y-4 border-t border-slate-800/80 pt-4 text-right">
                      <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">بنود الاتفاقية وإقرارات الالتزام</h4>

                      {/* البند الأول */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">البند الأول</span>
                          <span className="text-xs font-black text-white">المباشرة بالعمل</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed text-justify">
                          لا يحق للموظف الجديد المباشرة الفعلية بالعمل إلا بعد صدور أمر رسمي وصريح بالخطّ المباشر من هيئة الإعلام الإلكتروني.
                        </p>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold block">إقرار الموظف بالالتزام والتقيّد:</label>
                          <input
                            type="text"
                            value={clause1Answer}
                            onChange={(e) => setClause1Answer(e.target.value)}
                            placeholder="اكتب إقرارك بالالتزام هنا (مثال: أوافق وألتزم بالبند الأول)"
                            className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-700 shadow-inner"
                          />
                        </div>
                      </div>

                      {/* البند الثاني */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">البند الثاني</span>
                          <span className="text-xs font-black text-white">رسوم الإجراءات والتعيين</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed text-justify">
                          بعد سداد الرسوم الكاملة المقررة ومقدارها (140 دينار عراقي)، فإن هذا المبلغ يعتبر غير قابل للاسترداد نهائياً ولأي سبب من الأسباب.
                        </p>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold block">إقرار الموظف بالالتزام والتقيّد:</label>
                          <input
                            type="text"
                            value={clause2Answer}
                            onChange={(e) => setClause2Answer(e.target.value)}
                            placeholder="اكتب إقرارك بالالتزام هنا (مثال: أوافق وألتزم بالبند الثاني)"
                            className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-700 shadow-inner"
                          />
                        </div>
                      </div>

                      {/* البند الثالث */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">البند الثالث</span>
                          <span className="text-xs font-black text-white">التحديثات الرسمية والتحقق من الهوية</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed text-justify">
                          يتوجب على الموظف متابعة كافة تحديثات الوزارة والقرارات الرسمية عبر البريد الإلكتروني. لتفعيل حسابك ومتابعة استفساراتك، يُرجى إرسال رسالة بريدية تتضمن رقم هويتك المعتمد <strong className="text-amber-400">(6904275016)</strong> متبوعاً بـ اسمك الثلاثي الكامل.
                        </p>
                        
                        <a
                          href="https://mail.google.com/mail/?view=cm&fs=1&to=sts.Iraq.news@gmail.com&su=تفعيل حساب الموظف للتحقق من الهوية"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col sm:flex-row items-center justify-between p-2.5 bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 rounded-lg transition-all group/mail cursor-pointer gap-2"
                        >
                          <span className="text-[11px] text-slate-400 group-hover/mail:text-amber-400 transition text-right">
                            انقر هنا للمراسلة الفورية عبر بريد الدعم الفني:
                          </span>
                          <span className="text-xs text-amber-400 font-bold font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 group-hover/mail:bg-amber-500 group-hover/mail:text-slate-950 transition flex items-center gap-1.5">
                            <span>sts.Iraq.news@gmail.com</span>
                            <Mail className="w-3.5 h-3.5" />
                          </span>
                        </a>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold block">إقرار الموظف بالالتزام والتقيّد:</label>
                          <input
                            type="text"
                            value={clause3Answer}
                            onChange={(e) => setClause3Answer(e.target.value)}
                            placeholder="اكتب إقرارك بالالتزام هنا (مثال: أوافق وألتزم بالبند الثالث)"
                            className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-700 shadow-inner"
                          />
                        </div>
                      </div>

                      {/* البند الرابع */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">البند الرابع</span>
                          <span className="text-xs font-black text-white">الإقرار والموافقة النهائية</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed text-justify">
                          سؤال: هل أنت موافق ومُلتزم بجميع إجراءات وضوابط الوزارة وهيئة الإعلام الإلكتروني التي قمت بقراءتها والمشروحة في هذا العقد أعلاه؟
                        </p>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold block">الإجابة والموافقة النهائية (خطياً):</label>
                          <input
                            type="text"
                            value={clause4Answer}
                            onChange={(e) => setClause4Answer(e.target.value)}
                            placeholder="اكتب جوابك النهائي هنا (مثال: نعم، موافق وموافق نهائياً)"
                            className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-700 shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    {/* رسالة الخطأ إن وجدت */}
                    {contractError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                        <X className="w-4 h-4 shrink-0" />
                        <span>{contractError}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 px-4 flex flex-col items-center justify-center space-y-5">
                    <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-white">عقد اتفاق وبدء مباشر للموظفين الجدد</h3>
                    <p className="text-sm text-slate-300 max-w-md leading-relaxed text-center">
                      أهلاً بك في هيئة الإعلام الإلكتروني. تم إرسال ثبوتياتك وإقراراتك بنجاح وبانتظار الموافقة من قبل إدارة الهيئة.
                    </p>
                  </div>
                )}
              </div>

              {/* أسفل المودال */}
              <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 flex justify-end gap-3 shrink-0">
                {!showContractSuccess ? (
                  <>
                    <button
                      onClick={() => setShowContractModal(false)}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleContractSubmit}
                      className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
                    >
                      إرسال العقد
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowContractModal(false);
                      setShowContractSuccess(false);
                    }}
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
                  >
                    إغلاق العقد
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودال تسجيل دخول المسؤول (STS) */}
      <AnimatePresence>
        {showAdminLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-[#0d1520] to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative"
              dir="rtl"
            >
              <button
                onClick={() => setShowAdminLoginModal(false)}
                className="absolute top-4 left-4 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-400">بوابة الدخول الآمن لـ STS</h3>
                  <p className="text-[10px] text-slate-500 font-mono">SECURE ADMIN INTERFACE</p>
                </div>
              </div>

              <div className="space-y-4 text-right">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block pr-1">رمز المسؤول STS:</label>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAdminLoginError("");
                    }}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-3 px-4 text-center font-mono font-bold tracking-widest text-amber-400 text-sm focus:outline-none transition-all placeholder-slate-700"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (adminPasswordInput === "Gtasen1122@MN") {
                          setIsAdminLoggedIn(true);
                          setShowAdminPanel(true);
                          setShowAdminLoginModal(false);
                          setAdminPasswordInput("");
                        } else {
                          setAdminLoginError("الرمز السري غير صحيح، يرجى المحاولة مرة أخرى.");
                        }
                      }
                    }}
                  />
                </div>

                {adminLoginError && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] rounded-lg text-right flex items-center gap-2">
                    <X className="w-3.5 h-3.5 shrink-0" />
                    <span>{adminLoginError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAdminLoginModal(false)}
                    className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      if (adminPasswordInput === "Gtasen1122@MN") {
                        setIsAdminLoggedIn(true);
                        setShowAdminPanel(true);
                        setShowAdminLoginModal(false);
                        setAdminPasswordInput("");
                      } else {
                        setAdminLoginError("الرمز السري غير صحيح، يرجى المحاولة مرة أخرى.");
                      }
                    }}
                    className="flex-[2] py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
                  >
                    تسجيل الدخول
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Hamburger Menu Side Drawer */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-slate-950/80 z-50 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-gradient-to-b from-slate-900 via-[#0b131e] to-slate-950 border-r border-slate-800 z-50 shadow-2xl flex flex-col"
              dir="rtl"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-800/80 bg-slate-950/40 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={iraqiEmblem} alt="شعار العراق" className="w-10 h-10 object-cover rounded-full" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="font-serif font-black text-xs text-amber-400">بوابة موظفي الإعلام</h3>
                    <p className="text-[10px] text-slate-500 font-mono">MENU CONTROL PANEL</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1.5 rounded-full bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Status Card inside Drawer */}
              <div className="p-4 mx-4 my-3 bg-slate-950/60 border border-slate-800/60 rounded-xl flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold block">المستخدم الحالي:</span>
                  <span className="font-bold text-slate-200 text-xs">{selectedEmployee === "mohammed" ? "محمد حمزة عباس" : "عبد الله حيدر عباس"}</span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 flex-1 space-y-2 text-right">
                {/* Item 1: Training Status (Read Only Info) */}
                <div className="w-full p-3 bg-slate-900/40 border border-emerald-500/20 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-between select-none">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>تحت التدريب الامتحاني</span>
                  </div>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>

                {/* زر استلام الراتب المتناسق في القائمة الجانبية */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowBankIframe(true);
                  }}
                  className="w-full p-3 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/35 hover:border-amber-500 text-amber-400 font-bold text-xs rounded-xl transition-all duration-300 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span>استلام الراتب المستحق</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform rotate-180" />
                </button>

                {/* زر تنزيل الكتب والملازم في القائمة الجانبية */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowBooksIframe(true);
                  }}
                  className="w-full p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/35 hover:border-emerald-500 text-emerald-400 font-bold text-xs rounded-xl transition-all duration-300 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span>تنزيل الكتب والملازم للاختبار</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform rotate-180" />
                </button>

                {/* Item 2: Live Chat */}
                {(() => {
                  const lastMsg = chatMessages[chatMessages.length - 1];
                  const hasUnreadReplies = lastMsg && lastMsg.sender === "admin" && !showChat;
                  return (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowChat(true);
                      }}
                      className="w-full p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 font-bold text-xs rounded-xl transition-all duration-300 flex items-center justify-between group cursor-pointer relative"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span>الدردشة الحية مع خدمة الإدارة</span>
                      </div>
                      
                      {/* Notification Badge if has unread admin replies */}
                      {hasUnreadReplies && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </button>
                  );
                })()}


              </div>

              {/* Drawer Footer with Logout */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsLoggedIn(false);
                    setLoginMode("select");
                    setLoginCode("");
                    setLoginError("");
                    setCitizenPostalCode("");
                    setCitizenErrorMsg("");
                  }}
                  className="w-full py-3 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 text-xs font-black rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <span>تسجيل الخروج من البوابة</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* الجزء المخصص للمواطن: بوابة المواطن الفيدرالية المعتمدة */}
      {!showSplash && isCitizenLoggedIn && citizenUser && (
        <CitizenDashboard
          user={citizenUser}
          onLogout={handleCitizenLogout}
          chatMessages={citizenChatMessages}
          onSendMessage={handleSendCitizenMessage}
          iraqiEmblem={iraqiEmblem}
          currentTime={currentTime}
          currentDate={currentDate}
        />
      )}

      {/* Live Chat with Administration Modal */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-gradient-to-br from-slate-900 via-[#0d1520] to-slate-950 border border-slate-800 rounded-2xl shadow-2xl relative flex flex-col h-[550px] overflow-hidden animate-none"
              dir="rtl"
            >
              {/* Chat Header */}
              <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/85 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-xs text-amber-400 block">
                      الدردشة الحية والمراسلة الفورية
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono block">
                      مكتب خدمة وإدارة شؤون الموظفين - هـ.إ.ع
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-1.5 rounded-full bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Body (Messages Area) */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/20 scrollbar-thin flex flex-col">
                {chatMessages.length === 0 ? (
                  <div className="my-auto flex flex-col items-center text-center p-4">
                    <MessageSquare className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                    <h4 className="text-sm font-bold text-slate-300">لا توجد رسائل سابقة</h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                      يمكنك كتابة رسالة أدناه للتواصل مع إدارة الهيئة مباشرة، وسيتم الرد عليك في الوقت الفعلي.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isMe = msg.sender === "employee";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${
                          isMe ? "self-start items-start" : "self-end items-end"
                        }`}
                      >
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-amber-500 text-slate-950 rounded-tr-none font-bold shadow-lg shadow-amber-500/5"
                              : "bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800 shadow-md"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-600 mt-1 px-1 font-mono">{msg.time}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Area */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب استفسارك أو رسالتك للإدارة هنا..."
                    className="flex-1 bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none transition-all placeholder-slate-700 shadow-inner"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendEmployeeMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendEmployeeMessage}
                    className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition duration-300 active:scale-95 cursor-pointer shadow-lg hover:shadow-amber-500/20 flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4 transform rotate-180" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* بوابة استلام الراتب الإلكترونية */}
      {showBankIframe && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100" dir="rtl">
          {/* شريط علوي فاخر لجمهورية العراق مع زر الرجوع */}
          <header className="bg-slate-900 border-b border-slate-850 py-3 px-4 sm:px-6 shadow-xl flex justify-between items-center bg-gradient-to-l from-slate-900 via-slate-950 to-slate-900 shrink-0">
            <div className="flex items-center gap-3">
              {/* الشعار الوطني العراقي المعتمد */}
              <img
                src={iraqiEmblem}
                alt="شعار جمهورية العراق"
                className="w-10 h-10 sm:w-11 sm:h-11 object-cover rounded-full border border-amber-500/20 bg-slate-950 p-0.5"
                referrerPolicy="no-referrer"
              />
              <div className="text-right">
                <h2 className="font-serif font-bold text-xs sm:text-sm text-amber-400">
                  بوابة الصرف الإلكتروني الموحدة
                </h2>
                <span className="text-[9px] font-mono text-slate-500 block leading-none mt-1">
                  SECURE NATIONAL SALARY SYSTEM v2.7
                </span>
              </div>
            </div>

            {/* زر الرجوع المباشر والواضح للموقع الأصلي */}
            <button
              onClick={() => setShowBankIframe(false)}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-amber-500/20 transition-all duration-300 flex items-center gap-2 border border-amber-400/30 active:scale-95 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 shrink-0 text-slate-950" />
              <span>الرجوع للبوابة</span>
            </button>
          </header>

          {/* الإطار المدمج للموقع الخارجي بدقة كاملة */}
          <div className="flex-1 w-full relative bg-slate-900 overflow-hidden">
            <iframe
              src="https://bankiraq1122.pages.dev/"
              className="absolute inset-0 w-full h-full border-none bg-white"
              title="بوابة الصرف الإلكتروني العراقي"
              allow="payment; clipboard-read; clipboard-write"
            />
          </div>
        </div>
      )}

      {/* بوابة تحميل الكتب والملازم المخصصة للاختبار */}
      {showBooksIframe && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100" dir="rtl">
          {/* شريط علوي فاخر لجمهورية العراق مع زر الرجوع */}
          <header className="bg-slate-900 border-b border-slate-850 py-3 px-4 sm:px-6 shadow-xl flex justify-between items-center bg-gradient-to-l from-slate-900 via-slate-950 to-slate-900 shrink-0">
            <div className="flex items-center gap-3">
              {/* الشعار الوطني العراقي المعتمد */}
              <img
                src={iraqiEmblem}
                alt="شعار جمهورية العراق"
                className="w-10 h-10 sm:w-11 sm:h-11 object-cover rounded-full border border-amber-500/20 bg-slate-950 p-0.5"
                referrerPolicy="no-referrer"
              />
              <div className="text-right">
                <h2 className="font-serif font-bold text-xs sm:text-sm text-emerald-400">
                  بوابة المناهج والكتب التدريبية والامتحانية الموحدة
                </h2>
                <span className="text-[9px] font-mono text-slate-500 block leading-none mt-1">
                  NATIONAL STUDY & EXAM PORTAL v1.2
                </span>
              </div>
            </div>

            {/* زر الرجوع للبوابة */}
            <button
              onClick={() => setShowBooksIframe(false)}
              className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all duration-300 flex items-center gap-2 border border-emerald-400/30 active:scale-95 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 shrink-0 text-slate-950" />
              <span>الرجوع للبوابة</span>
            </button>
          </header>

          {/* الإطار المدمج للموقع الخارجي بدقة كاملة */}
          <div className="flex-1 w-full relative bg-slate-900 overflow-hidden">
            <iframe
              src="https://bookslob1.pages.dev/"
              className="absolute inset-0 w-full h-full border-none bg-white"
              title="بوابة تنزيل الكتب والملازم"
              allow="payment; clipboard-read; clipboard-write"
            />
          </div>
        </div>
      )}
    </div>
  );
}
